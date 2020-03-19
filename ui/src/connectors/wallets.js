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
    href: null,
  },
  // TODO: Enable when you get it to work
  // WALLET_CONNECT: {
  //   name: 'Wallet Connect',
  //   connector: walletconnect,
  //   type: 'walletconnect',
  //   icon: '/wallet-connect.png',
  //   description:
  //     'Connect to Trust Wallet, Rainbow Wallet and others on your phone.',
  //   href: null,
  // },
}
