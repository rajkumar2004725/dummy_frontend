import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { getAuthHeaders, mintBackgroundNFT, verifyBackgroundStatus } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useWallet } from '@/contexts/WalletContext';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const API_BASE_URL = 'http://localhost:3001';

const CreateBackground = () => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingBackgroundId, setPendingBackgroundId] = useState<number | null>(null);
  const { address, connect, disconnect, isConnected, getToken } = useWallet();

  useEffect(() => {
    // Check if user is connected
    if (!address) {
      toast.error('Please connect your wallet first');
      setDialogOpen(false);
    }
  }, [address, dialogOpen]);

  // Poll for background status if we have a pending background
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (pendingBackgroundId) {
      // Initial check
      checkBackgroundStatus(pendingBackgroundId);
      
      // Set up polling every 10 seconds
      intervalId = setInterval(() => {
        checkBackgroundStatus(pendingBackgroundId);
      }, 10000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pendingBackgroundId]);

  const checkBackgroundStatus = async (backgroundId: number) => {
    try {
      const result = await verifyBackgroundStatus(backgroundId);
      console.log('Background status check:', result);
      
      if (result.status === 'confirmed' && result.background.blockchainId) {
        // Success! The background has been confirmed on the blockchain
        toast.success(
          <div>
            Background NFT successfully minted on blockchain!
            <br/>
            <a 
              href={`https://sepolia.etherscan.io/tx/${result.background.transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Etherscan
            </a>
            <div className="mt-2">
              <span className="font-semibold">Blockchain ID:</span> {result.background.blockchainId}
            </div>
          </div>,
          { duration: 10000 }
        );
        
        // Clear the pending background
        setPendingBackgroundId(null);
      } else if (result.status === 'failed') {
        // The transaction failed
        toast.error('Transaction failed on the blockchain. Please try again.');
        setPendingBackgroundId(null);
      }
      // For other statuses (pending, etc.), we'll continue polling
      
    } catch (error) {
      console.error('Error checking background status:', error);
    }
  };

  const categories = [
    'Birthday Cards',
    'Wedding Cards',
    'New Year Cards',
    'Love & Romance Cards',
    'Appreciation Cards',
    'Trading Sentiment Cards'
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!address) {
        toast.error('Please connect your wallet first');
        setLoading(false);
        return;
      }

      if (!image || !category || !price) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }

      console.log('Submitting form data for NFT minting:', {
        category,
        price,
        artistAddress: address,
        image: image.name
      });
      
      toast.loading('Minting background NFT on the blockchain. Please wait...');
      
      // Use the mintBackgroundNFT API service
      const response = await mintBackgroundNFT({
        image,
        category,
        price
      });

      console.log('Background NFT minted:', response);
      
      toast.dismiss();
      
      // Handle both response formats - either nested or direct background object
      const background = response.background || response;

      if (response.warning) {
        toast.error(`Warning: ${response.warning}${response.error ? `: ${response.error}` : ''}`);
      } else if (background && background.transactionHash) {
        // Set the pending background ID for status polling
        setPendingBackgroundId(background.id);
        
        toast.success(
          <div>
            Background NFT minting in progress...
            <br/>
            <a 
              href={`https://sepolia.etherscan.io/tx/${background.transactionHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Etherscan
            </a>
            {background.message && (
              <div className="mt-2 text-xs opacity-80">
                {background.message}
              </div>
            )}
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.success(
          <div>
            Background created but not yet minted on blockchain.
            {background.message && (
              <div className="mt-2 text-xs opacity-80">
                {background.message}
              </div>
            )}
          </div>
        );
      }
      
      // Reset form after successful submission
      setImage(null);
      setPreviewUrl('');
      setCategory('');
      setPrice('');
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error minting background NFT:', error);
      
      toast.dismiss();
      const errorMessage = error.response?.data?.error || error.message || 'Failed to mint background NFT';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B14] relative">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      <Navbar />
      
      <div className="content-container relative z-10 pt-28 pb-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-display font-medium text-white mb-2">
            Create Background
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </motion.div>

        <div className="flex justify-center">
          <Button 
            onClick={() => address ? setDialogOpen(true) : connect('your_wallet_address')} 
            className="bg-gradient-to-r from-primary to-secondary text-white py-4 px-8 rounded-xl text-lg font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            {address ? 'Create New Background' : 'Connect Wallet First'}
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <VisuallyHidden>
              <DialogTitle>Create New Background</DialogTitle>
            </VisuallyHidden>
            <DialogDescription>
              Upload an image and set its category and price to create a new background.
            </DialogDescription>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <label className="block text-lg text-white mb-4">Background Image</label>
                <div className="relative">
                  {!previewUrl ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">High-quality image (PNG, JPG)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setPreviewUrl('');
                        }}
                        className="absolute top-2 right-2 bg-red-500/20 text-red-400 rounded-full p-1 hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <label className="block text-lg text-white mb-4">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Input */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <label className="block text-lg text-white mb-4">Price (in ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in ETH"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setDialogOpen(false)} 
                  variant="outline" 
                  className="mr-4"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !image || !category || !price}
                  className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                >
                  {loading ? 'Creating...' : 'Create Background'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CreateBackground;
