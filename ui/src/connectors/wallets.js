import { injected, walletconnect } from './index'

export default {
  METAMASK: {
    name: 'MetaMask',
    connector: injected,
    icon: 'metamask.png',
    description: 'Connect to Metamask',
    href: 'https://metamask.io/',
  },
  COINBASE_WALLET: {
    name: 'Coinbase Wallet',
    connector: 'walletlink',
    icon: 'coinbase-wallet.png',
    description: 'Connect to Coinbase Wallet on your phone',
    href: null,
  },
  WALLET_CONNECT: {
    name: 'Wallet Connect',
    connector: walletconnect,
    icon: 'wallet-connect.png',
    description: 'Connect to Wallet Connect',
    href: null,
  },
}
