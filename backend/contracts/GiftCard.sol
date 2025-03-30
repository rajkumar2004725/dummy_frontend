// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract NFTGiftMarketplace is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Address for address payable;
    using ECDSA for bytes32;

    Counters.Counter private _tokenIdCounter;

    struct GiftCard {
        address creator;
        address currentOwner;
        uint256 price;
        bool forSale;
        string message;
        bytes32 secretHash;
    }

    mapping(uint256 => GiftCard) public giftCards;
    mapping(bytes32 => bool) private hashUsed;

    event GiftCardMinted(uint256 indexed tokenId, address indexed creator, uint256 price);
    event GiftCardPurchased(uint256 indexed tokenId, address indexed buyer, string message);
    event GiftCardClaimed(uint256 indexed tokenId, address indexed recipient);

    constructor() ERC721("NFTGiftCard", "NGC") {}

    function mintGiftCard(string memory _tokenURI, uint256 price) external {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        giftCards[tokenId] = GiftCard({
            creator: msg.sender,
            currentOwner: msg.sender,
            price: price,
            forSale: true,
            message: "",
            secretHash: 0
        });

        emit GiftCardMinted(tokenId, msg.sender, price);
    }

    function buyGiftCard(uint256 tokenId, string memory message) external payable {
        GiftCard storage giftCard = giftCards[tokenId];
        require(giftCard.forSale, "Gift card not for sale");
        require(msg.value == giftCard.price, "Incorrect price");

        address payable seller = payable(giftCard.currentOwner);
        uint256 artistShare = (msg.value * 40) / 100;
        uint256 platformShare = msg.value - artistShare;

        payable(giftCard.creator).sendValue(artistShare);
        payable(owner()).sendValue(platformShare);
        
        _transfer(seller, msg.sender, tokenId);
        giftCard.currentOwner = msg.sender;
        giftCard.forSale = false;
        giftCard.message = message;

        emit GiftCardPurchased(tokenId, msg.sender, message);
    }

    function setSecretKey(uint256 tokenId, string memory secret) external {
        require(ownerOf(tokenId) == msg.sender, "Only owner can set secret key");
        bytes32 secretHash = keccak256(abi.encodePacked(secret));
        require(!hashUsed[secretHash], "Secret already used");
        
        hashUsed[secretHash] = true;
        giftCards[tokenId].secretHash = secretHash;
    }

    function claimGiftCard(uint256 tokenId, string memory secret) external {
        GiftCard storage giftCard = giftCards[tokenId];
        require(giftCard.secretHash == keccak256(abi.encodePacked(secret)), "Invalid secret");
        require(giftCard.currentOwner != address(0), "Invalid gift card");

        _transfer(giftCard.currentOwner, msg.sender, tokenId);
        giftCard.currentOwner = msg.sender;
        giftCard.secretHash = 0; // Prevent reuse

        emit GiftCardClaimed(tokenId, msg.sender);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
