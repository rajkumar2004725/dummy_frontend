
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
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

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-4 md:px-8',
        scrolled ? 'bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-subtle' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity hover:opacity-80"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-display font-medium">Giftly</span>
        </Link>
        
        {/* Main Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" active={location.pathname === "/"}>
            Home
          </NavLink>
          <NavLink to="/create" active={location.pathname === "/create"}>
            Create Gift
          </NavLink>
          <NavLink to="/claim" active={location.pathname === "/claim"}>
            Claim Gift
          </NavLink>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="p-2 rounded-full hover:bg-accent transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
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
      className={cn(
        'relative py-2 transition-colors duration-200',
        active ? 'text-primary' : 'text-foreground hover:text-primary'
      )}
    >
      {children}
      <span 
        className={cn(
          'absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-primary transform transition-transform duration-300 origin-left',
          active ? 'scale-x-100' : 'scale-x-0'
        )}
      />
    </Link>
  );
};

export default Navbar;
