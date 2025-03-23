
import React from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GiftCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const GiftCard = ({
  title,
  description,
  icon,
  to,
  variant = 'primary',
  className,
}: GiftCardProps) => {
  return (
    <div 
      className={cn(
        'glass-card rounded-2xl p-8 transition-all duration-300 hover-lift',
        variant === 'primary' ? 'border-primary/20' : 'border-secondary/20',
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div 
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center transform transition-transform hover:rotate-6',
            variant === 'primary' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary/10 text-secondary'
          )}
        >
          {icon}
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-display font-medium">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <Link to={to} className="w-full">
          <Button 
            variant={variant === 'primary' ? 'primary' : 'secondary'} 
            fullWidth
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {variant === 'primary' ? 'Claim Now' : 'Create Now'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default GiftCard;
