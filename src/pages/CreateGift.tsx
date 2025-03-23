
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      
      <div className="flex-1 pt-32 pb-24">
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
                    <div className="absolute inset-0 bg-secondary/20 rounded-full animate-pulse-slow" />
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Gift className="w-10 h-10 text-secondary" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3">
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
                        className="h-14 text-lg"
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
                        className="h-14 text-lg bg-gray-100 dark:bg-gray-800"
                        icon={<Wallet className="w-5 h-5" />}
                        onClick={() => toast.info('Connect wallet feature coming soon!')}
                      >
                        Connect a Wallet
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Create a wallet with <span className="font-medium">Face ID</span> or <span className="font-medium">Touch ID</span>
                  </div>
                  
                  <div className="pt-16 pb-8 w-full">
                    <h2 className="text-2xl font-display font-medium text-center mb-10">
                      Create a Gift Pack
                    </h2>
                    
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="max-w-xs mx-auto"
                    >
                      <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        className="h-14 text-lg"
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
                  
                  <h1 className="text-3xl sm:text-4xl font-display font-medium mb-3">
                    Create a Gift
                  </h1>
                  <p className="text-muted-foreground">
                    Send a special gift with a personalized message
                  </p>
                </div>
                
                <div className="glass-card rounded-xl p-8">
                  <form onSubmit={handleCreateGift} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="recipientName" className="block text-sm font-medium mb-1">
                          Recipient's Name
                        </label>
                        <Input
                          id="recipientName"
                          name="recipientName"
                          placeholder="Who's this gift for?"
                          value={giftDetails.recipientName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="yourName" className="block text-sm font-medium mb-1">
                          Your Name
                        </label>
                        <Input
                          id="yourName"
                          name="yourName"
                          placeholder="Who's this gift from?"
                          value={giftDetails.yourName}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-1">
                          Your Message
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Write a heartfelt message..."
                          rows={5}
                          value={giftDetails.message}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setView('options')} 
                        className="flex-1"
                      >
                        Back
                      </Button>
                      
                      <Button 
                        type="submit" 
                        loading={loading}
                        icon={<Send className="w-4 h-4" />}
                        className="flex-1"
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
                    <h2 className="text-3xl font-display font-medium">Gift Created!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Share this secret code with {giftDetails.recipientName} so they can claim their gift.
                    </p>
                  </div>
                  
                  <div className="max-w-sm mx-auto">
                    <div 
                      className="p-4 bg-muted rounded-lg font-mono text-xl flex items-center justify-between"
                      role="button"
                      onClick={copyToClipboard}
                    >
                      <span>{secretCode}</span>
                      <button 
                        type="button" 
                        className="p-2 hover:bg-background rounded-md transition-colors"
                        aria-label="Copy to clipboard"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-muted/50 rounded-lg max-w-md mx-auto text-left">
                    <p className="text-sm text-muted-foreground mb-2">Gift Preview:</p>
                    <p className="text-base">
                      <span className="font-medium">To:</span> {giftDetails.recipientName}
                    </p>
                    <p className="text-base">
                      <span className="font-medium">From:</span> {giftDetails.yourName}
                    </p>
                    <p className="text-base mt-2">
                      {giftDetails.message}
                    </p>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                    <Button variant="outline" onClick={resetForm}>
                      Create Another Gift
                    </Button>
                    <Button 
                      variant="secondary" 
                      icon={<Copy className="w-4 h-4" />}
                      onClick={copyToClipboard}
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
    </div>
  );
};

export default CreateGift;
