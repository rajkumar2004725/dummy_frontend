declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectMetaMask = async (): Promise<string> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the first account
      const address = accounts[0];
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', function (accounts: string[]) {
        // Reload the page to reset the app state with new account
        window.location.reload();
      });

      return address;
    } catch (error) {
      console.error('Error connecting to MetaMask', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask is not installed');
  }
};

export const connectWallet = async (walletId: string): Promise<string> => {
  switch (walletId) {
    case 'metamask':
      return await connectMetaMask();
    // Add other wallet connections here
    default:
      throw new Error('Wallet not supported');
  }
};
