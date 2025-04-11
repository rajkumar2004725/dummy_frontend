declare global {
  interface Window {
    ethereum?: any;
  }
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

// Get MetaMask network
export const getMetaMaskChainId = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    throw error;
  }
};

export const connectMetaMask = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    // Open MetaMask installation page
    window.open('https://metamask.io/download/', '_blank');
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet.');
    }
    
    // Get the first account
    const address = accounts[0];
    
    // For development, we can use Sepolia testnet
    // In production, you might want to add chain switching logic here
    
    console.log('MetaMask connected with address:', address);
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', function (accounts: string[]) {
      if (accounts.length === 0) {
        console.log('MetaMask disconnected, reloading page');
        // User disconnected account
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('token');
      }
      // Reload the page to reset the app state with new account
      window.location.reload();
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', function (chainId: string) {
      console.log('MetaMask chain changed, reloading page');
      // Reload the page on chain change
      window.location.reload();
    });

    return address;
  } catch (error: any) {
    console.error('Error connecting to MetaMask', error);
    
    // Handle common MetaMask errors
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    } else if (error.code === -32002) {
      throw new Error('MetaMask is already processing a connection request');
    }
    
    throw error;
  }
};

export const connectWallet = async (walletId: string): Promise<string> => {
  switch (walletId) {
    case 'metamask':
      return await connectMetaMask();
    case 'coinbase':
      throw new Error('Coinbase Wallet integration coming soon');
    case 'walletconnect':
      throw new Error('WalletConnect integration coming soon');
    case 'brave':
      return await connectMetaMask(); // Brave browser uses the same provider interface
    case 'rainbow':
      throw new Error('Rainbow Wallet integration coming soon');
    default:
      throw new Error('Wallet not supported');
  }
};
