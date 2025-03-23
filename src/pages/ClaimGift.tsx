
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24">
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
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-10 h-10 text-primary" />
                  </div>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3">
                  Claim Your Gift
                </h1>
                <p className="text-muted-foreground">
                  Enter the secret message to reveal what's been sent to you
                </p>
              </motion.div>
              
              <motion.div
                className="glass-card rounded-xl p-8"
                variants={itemVariants}
              >
                <form onSubmit={handleClaim} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="secretMessage" className="block text-sm font-medium">
                      Secret Message
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="secretMessage"
                        type="text"
                        placeholder="Enter secret message..."
                        className="pl-10"
                        value={secretMessage}
                        onChange={(e) => setSecretMessage(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hint: Try "demo" to see a sample gift
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    loading={loading}
                    icon={<ArrowRight className="w-4 h-4" />}
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
              <div className="glass-card rounded-xl p-10 space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 mx-auto relative"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Gift className="w-12 h-12 text-primary" />
                  </div>
                </motion.div>
                
                <div className="space-y-4">
                  <h2 className="text-3xl font-display font-medium">Congratulations!</h2>
                  <p className="text-xl text-muted-foreground">
                    You've successfully claimed your gift
                  </p>
                </div>
                
                <div className="p-6 bg-muted/50 rounded-lg max-w-md mx-auto">
                  <p className="text-lg italic">
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
