
import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Heart, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/50 py-12 mt-auto">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-display font-medium">Giftly</span>
            </div>
            
            <p className="text-muted-foreground max-w-md">
              A beautiful way to share and receive gifts. Send love, surprise, and joy to your friends and loved ones.
            </p>
            
            <div className="flex items-center space-x-6 text-muted-foreground">
              <a 
                href="#" 
                className="hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-base font-medium mb-3">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-muted-foreground hover:text-primary transition-colors">
                  Create a Gift
                </Link>
              </li>
              <li>
                <Link to="/claim" className="text-muted-foreground hover:text-primary transition-colors">
                  Claim a Gift
                </Link>
              </li>
            </ul>
          </div>
          
          {/* More Links Section */}
          <div className="space-y-4">
            <h4 className="text-base font-medium mb-3">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Giftly. All rights reserved.
          </p>
          
          <div className="mt-4 sm:mt-0 flex items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-3 w-3 text-primary mx-1" /> using modern technologies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
