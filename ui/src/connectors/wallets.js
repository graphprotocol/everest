import { injected, walletconnect, walletlink } from './index'

export default {
  METAMASK: {
    name: 'MetaMask',
    connector: injected,
    type: 'injected',
    icon: '/metamask.png',
    description: 'Activate or install Metamask',
    href: 'https://metamask.io/',
  },
  COINBASE_WALLET: {
    name: 'Coinbase Wallet',
    connector: walletlink,
    type: 'walletlink',
    icon: '/coinbase-wallet.png',
    description: 'Connect to Coinbase Wallet on your phone',
    href: 'https://go.cb-w.com/mtUDhEZPy1',
    mobileName: 'Open in Coinbase Wallet',
  },
  WALLET_CONNECT: {
    name: 'Wallet Connect',
    connector: walletconnect,
    type: 'walletconnect',
    icon: '/wallet-connect.png',
    description:
      'Connect to Trust Wallet, Rainbow Wallet and others on your phone.',
    href:
      'https://link.trustwallet.com/open_url?coin_id=60&url=http://everest.link',
    mobileName: 'Open in Trust Wallet',
  },
}
