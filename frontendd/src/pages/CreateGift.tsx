import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import WalletConnectDialog from '@/components/WalletConnectDialog';
import { Heart, Send, Copy, Check, Gift, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const CreateGift = () => {
  const [view, setView] = useState('options'); // 'options', 'form', 'success'
  const [giftDetails, setGiftDetails] = useState({
    recipientName: '',
    yourName: '',
    message: '',
  });
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGiftDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!giftDetails.recipientName || !giftDetails.yourName || !giftDetails.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate random secret code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSecretCode(generatedCode);
      setLoading(false);
      setView('success');
    }, 1500);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretCode);
    setCopied(true);
    toast.success('Secret code copied to clipboard!');
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const resetForm = () => {
    setGiftDetails({
      recipientName: '',
      yourName: '',
      message: '',
    });
    setSecretCode('');
    setView('options');
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
          <div className="max-w-2xl mx-auto">
            {view === 'options' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-16">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-secondary/30 rounded-full animate-pulse-slow" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl font-display font-medium mb-3 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                    Create a Gift Pack
                  </h1>
                </div>
                
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full flex justify-center gap-4">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="flex-1 max-w-xs"
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        className="h-14 text-lg bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-white font-medium shadow-xl shadow-primary/20"
                        icon={<Wallet className="w-5 h-5" />}
                        onClick={() => toast.info('Create wallet feature coming soon!')}
                      >
                        Create a Wallet
                      </Button>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="flex-1 max-w-xs"
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        fullWidth
                        className="h-14 text-lg border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium shadow-xl"
                        icon={<Wallet className="w-5 h-5" />}
                        onClick={() => setWalletDialogOpen(true)}
                      >
                        Connect a Wallet
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="text-center text-base text-white/80">
                    Create a wallet with <span className="font-medium text-white">Face ID</span> or <span className="font-medium text-white">Touch ID</span>
                  </div>
                  
                  <div className="pt-16 pb-8 w-full">
                    <h2 className="text-3xl font-display font-medium text-center mb-10 text-white">
                      Make Gift Giving Special
                    </h2>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="max-w-xs mx-auto"
                    >
                      <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        className="h-14 text-lg bg-gradient-to-r from-secondary/90 to-primary/90 hover:from-secondary hover:to-primary text-white font-medium shadow-xl shadow-secondary/20"
                        icon={<Gift className="w-5 h-5" />}
                        onClick={() => setView('form')}
                      >
                        Create Gift Pack
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ) : view === 'form' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-10">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse-slow" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-secondary" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3 text-white">
                    Create a Gift
                  </h1>
                  <p className="text-gray-300">
                    Send a special gift with a personalized message
                  </p>
                </div>
                
                <div className="glass-card rounded-xl p-8">
                  <form onSubmit={handleCreateGift} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="recipientName" className="block text-sm font-medium mb-1 text-gray-300">
                          Recipient's Name
                        </label>
                        <Input
                          id="recipientName"
                          name="recipientName"
                          placeholder="Who's this gift for?"
                          value={giftDetails.recipientName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="yourName" className="block text-sm font-medium mb-1 text-gray-300">
                          Your Name
                        </label>
                        <Input
                          id="yourName"
                          name="yourName"
                          placeholder="Who's this gift from?"
                          value={giftDetails.yourName}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-300">
                          Your Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Write a heartfelt message..."
                          rows={5}
                          value={giftDetails.message}
                          onChange={handleInputChange}
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setView('options')} 
                        className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>
                      
                      <Button 
                        type="submit" 
                        loading={loading}
                        icon={<Send className="w-4 h-4" />}
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        {loading ? 'Creating Gift...' : 'Create Gift'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="glass-card rounded-xl p-10 space-y-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto relative"
                  >
                    <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse-slow" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Gift className="w-12 h-12 text-secondary" />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-medium text-white">Gift Created!</h2>
                    <p className="text-gray-300 max-w-md mx-auto">
                      Share this secret code with {giftDetails.recipientName} so they can claim their gift.
                    </p>
                  </div>
                  
                  <div className="max-w-sm mx-auto">
                    <div 
                      className="p-4 bg-white/5 border border-white/10 rounded-lg font-mono text-xl flex items-center justify-between text-white"
                      role="button"
                      onClick={copyToClipboard}
                    >
                      <span>{secretCode}</span>
                      <button 
                        type="button" 
                        className="p-2 hover:bg-white/10 rounded-md transition-colors"
                        aria-label="Copy to clipboard"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white/5 border border-white/10 rounded-lg max-w-md mx-auto text-left">
                    <p className="text-sm text-gray-400 mb-2">Gift Preview:</p>
                    <p className="text-base text-white">
                      <span className="font-medium text-gray-300">To:</span> {giftDetails.recipientName}
                    </p>
                    <p className="text-base text-white">
                      <span className="font-medium text-gray-300">From:</span> {giftDetails.yourName}
                    </p>
                    <p className="text-base mt-2 text-white">
                      {giftDetails.message}
                    </p>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={resetForm}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                      Create Another Gift
                    </Button>
                    <Button 
                      variant="secondary" 
                      icon={<Copy className="w-4 h-4" />}
                      onClick={copyToClipboard}
                      className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                    >
                      {copied ? 'Copied!' : 'Copy Secret Code'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
      
      <WalletConnectDialog 
        open={walletDialogOpen} 
        onOpenChange={setWalletDialogOpen} 
      />
    </div>
  );
};

export default CreateGift;
