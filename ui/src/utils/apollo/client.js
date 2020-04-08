import { InMemoryCache } from 'apollo-boost'
import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import everestMutations from 'everest-mutations'

import { createMutations, createMutationsLink } from '@graphprotocol/mutations'

let provider

try {
  const WalletLink = require('walletlink')

  if (typeof window !== undefined) {
    const storage = window.localStorage.getItem('WALLET_CONNECTOR')
    if (storage) {
      const walletConnector = JSON.parse(storage)
      if (walletConnector.name === 'walletlink') {
        if (WalletLink) {
          const walletlink = new WalletLink.WalletLink({
            appName: 'Everest',
            appLogoUrl: '',
          })

          provider = walletlink.makeWeb3Provider(
            process.env.GATSBY_NETWORK_CONNECTOR_URI,
            process.env.GATSBY_CHAIN_ID,
          )
        }
      } else if (walletConnector.name === 'injected') {
        provider = window.web3.currentProvider
      }
    }
  } else {
    provider = window.web3.currentProvider
  }
} catch (e) {
  provider
}

const ipfsURI = process.env.GATSBY_IPFS_HTTP_URI
const mutations = createMutations({
  mutations: {
    resolvers: everestMutations.resolvers,
    config: everestMutations.config,
    stateBuilder: everestMutations.stateBuilder,
  },
  subgraph: 'everest',
  config: {
    ethereum: async () => {
      const { ethereum } = window

      if (!ethereum) {
        throw Error('Please use web3 enabled browser')
      }

      await provider.enable()
      return provider
    },
    ipfs: ipfsURI,
  },
})

const queryLink = createHttpLink({
  uri: process.env.GATSBY_GRAPHQL_HTTP_URI,
})

const mutationLink = createMutationsLink({ mutations })

const link = split(
  ({ query }) => {
    const node = getMainDefinition(query)
    return node.kind === 'OperationDefinition' && node.operation === 'mutation'
  },
  mutationLink,
  queryLink,
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

export default client
