import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

const POLLING_INTERVAL = 10000

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
})

export const walletconnect = new WalletConnectConnector({
  rpc: {
    // 3: 'https://ropsten.infura.io/v3/038f06bdd4de43b4a2f96ff2608b2a34',
    1: 'https://mainnet.infura.io/v3/859d787f4ca9498aaa9f738b9bb0650f',
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: false,
  pollingInterval: POLLING_INTERVAL,
})

// export const walletlink = new WalletLinkConnector({
//   url: process.env.REACT_APP_NETWORK_URL,
//   appName: 'Test',
//   appLogoUrl:
//     'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg',
// })
