/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module '@theqrl/wallet.js/src/dilithium';
declare module '@theqrl/wallet.js/src/utils/mnemonic'