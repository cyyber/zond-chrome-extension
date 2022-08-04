import { defineStore } from 'pinia';

export const useWalletStore = defineStore('wallets', {
  state: (): { secure: { name: string; address: string; }[]; count: number }  => {
    return { 
      secure: [
        {
          name: 'Wallet 1',
          address: '0x0',
        },
        {
          name: 'Wallet 2',
          address: '0x123',
        }
      ],
      count: 2 };
  },
});
