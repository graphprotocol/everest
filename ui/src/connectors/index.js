import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { NetworkConnector } from '@web3-react/network-connector'

const POLLING_INTERVAL = 10000

export const network = new NetworkConnector({
  urls: { 1: process.env.GATSBY_NETWORK_CONNECTOR_URI },
  pollingInterval: POLLING_INTERVAL,
})

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
})

export const walletconnect = new WalletConnectConnector({
  rpc: {
    1: process.env.GATSBY_NETWORK_CONNECTOR_URI,
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: false,
  pollingInterval: POLLING_INTERVAL,
})

// Coinbase wallet
export const walletlink = new WalletLinkConnector({
  url: process.env.GATSBY_NETWORK_CONNECTOR_URI,
  appName: 'Everest',
  appLogoUrl: '',
})
