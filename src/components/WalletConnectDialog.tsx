
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletOption {
  id: string;
  name: string;
  logo: string;
  status?: 'recommended' | 'installed';
}

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const walletOptions: WalletOption[] = [
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    status: 'recommended'
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png',
    status: 'installed'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: '/lovable-uploads/f6a6f43f-d2ee-4ba6-83c1-8c143386d6f5.png'
  }
];

const WalletConnectDialog: React.FC<WalletConnectDialogProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 text-white border-none p-0 max-w-md w-full overflow-hidden rounded-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 w-6 h-6 rounded-md flex items-center justify-center">
              <span className="text-white text-xs">❤️</span>
            </div>
            <h2 className="text-xl font-bold">Connect to Onchain Gift</h2>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="divide-y divide-gray-800">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                className="flex items-center gap-3 w-full p-4 hover:bg-gray-800/50 transition-colors text-left"
                onClick={() => {
                  // Placeholder for wallet connection logic
                  console.log(`Connecting to ${wallet.name}`);
                }}
              >
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                  {wallet.id === 'brave' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-orange-500 text-2xl">🦁</div>
                    </div>
                  ) : wallet.id === 'metamask' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-orange-500 text-2xl">🦊</div>
                    </div>
                  ) : wallet.id === 'rainbow' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">🌈</div>
                    </div>
                  ) : wallet.id === 'walletconnect' ? (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">
                        <Wallet className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white w-full h-full flex items-center justify-center">
                      <div className="text-blue-500 text-2xl">□</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold">{wallet.name}</div>
                  {wallet.status && (
                    <div className={cn(
                      "text-sm",
                      wallet.status === 'recommended' ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {wallet.status === 'recommended' ? 'Recommended' : 'Installed'}
                    </div>
                  )}
                </div>
              </button>
            ))}
            
            <button
              className="flex items-center gap-3 w-full p-4 hover:bg-gray-800/50 transition-colors text-left"
            >
              <div className="bg-gray-700 w-12 h-12 rounded-lg flex items-center justify-center">
                <div className="text-gray-400 text-2xl">••</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold">All Wallets</div>
              </div>
              <div className="text-sm text-gray-500 px-2 py-0.5 bg-gray-800 rounded">500+</div>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-800 flex justify-between items-center">
          <div className="text-gray-400">New to wallets?</div>
          <button className="text-blue-400 font-medium">Get started</button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
