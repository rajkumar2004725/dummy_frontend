import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Gift, ShoppingBag } from 'lucide-react';
import WalletConnectDialog from './WalletConnectDialog';
import AccountMenu from './AccountMenu';
import Button from './Button';
import { useWallet } from '@/contexts/WalletContext';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const { address, connect } = useWallet();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConnect = (newAddress: string) => {
    connect(newAddress);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10",
      scrolled && "bg-black/50"
    )}>
      <div className="content-container py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">OnChain-GiftPack</span>
          </Link>
          
          {/* Main Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" active={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink to="/marketplace" active={location.pathname.startsWith("/marketplace")}>
              Marketplace
            </NavLink>
            <NavLink to="/about" active={location.pathname === "/about"}>
              About Us
            </NavLink>
            <NavLink to="/create" active={location.pathname === "/create"}>
              Create Gift
            </NavLink>
            <NavLink to="/claim" active={location.pathname === "/claim"}>
              Claim Gift
            </NavLink>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            {address ? (
              <AccountMenu address={address} />
            ) : (
              <Button onClick={() => setWalletDialogOpen(true)}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      <WalletConnectDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleConnect}
      />
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink = ({ to, active, children }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={`relative px-3 py-2 transition-colors ${
        active 
          ? 'text-white' 
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
      )}
    </Link>
  );
};

export default Navbar;
