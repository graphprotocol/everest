import { injected, walletconnect, walletlink } from './index'

export default {
  METAMASK: {
    name: 'MetaMask',
    connector: injected,
    type: 'injected',
    icon: 'metamask.png',
    description: 'Activate or install Metamask',
    href: 'https://metamask.io/',
  },
  COINBASE_WALLET: {
    name: 'Coinbase Wallet',
    connector: walletlink,
    type: 'walletlink',
    icon: 'coinbase-wallet.png',
    description: 'Connect to Coinbase Wallet on your phone',
    href: 'https://www.walletlink.org/#/',
  },
  // Not implemented yet
  WALLET_CONNECT: {
    name: 'Wallet Connect',
    connector: walletconnect,
    type: 'walletconnect',
    icon: 'wallet-connect.png',
    description: 'Coming soon',
    href: '',
  },
}
