import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Gift, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const ClaimGift = () => {
  const [secretMessage, setSecretMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  
  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretMessage.trim()) {
      toast.error('Please enter a secret message');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      if (secretMessage.toLowerCase() === 'demo') {
        setClaimed(true);
        toast.success('Gift claimed successfully!');
      } else {
        toast.error('Invalid secret message. Please try again.');
      }
    }, 1500);
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0B14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-1000"></div>

      <Navbar />
      
      <div className="flex-1 pt-32 pb-24 relative z-10">
        <div className="content-container">
          {!claimed ? (
            <motion.div 
              className="max-w-xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div 
                className="text-center mb-10"
                variants={itemVariants}
              >
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-display font-medium mb-3 text-white bg-gradient-to-r from-primary to-secondary bg-clip-text">
                  Claim Your Gift
                </h1>
                <p className="text-gray-300 text-lg">
                  Enter the secret message to reveal what's been sent to you
                </p>
              </motion.div>
              
              <motion.div
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl"
                variants={itemVariants}
              >
                <form onSubmit={handleClaim} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="secretMessage" className="block text-sm font-medium text-gray-300">
                      Secret Message
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="secretMessage"
                        type="text"
                        placeholder="Enter secret message..."
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        value={secretMessage}
                        onChange={(e) => setSecretMessage(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Hint: Try "demo" to see a sample gift
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    loading={loading}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-white font-medium shadow-xl shadow-primary/20"
                  >
                    {loading ? 'Claiming...' : 'Claim Gift'}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-10 space-y-8 shadow-2xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                </motion.div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-display font-medium text-white bg-gradient-to-r from-primary to-secondary bg-clip-text">Congratulations!</h2>
                  <p className="text-xl text-gray-300">
                    You've successfully claimed your gift
                  </p>
                </div>
                
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg max-w-md mx-auto border border-white/10">
                  <p className="text-lg italic text-gray-300">
                    "This is a sample gift message. In a real gift, you would see the personalized message from your sender here."
                  </p>
                </div>
                
                <div className="pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setClaimed(false);
                      setSecretMessage('');
                    }}
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium shadow-xl"
                  >
                    Claim Another Gift
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClaimGift;
