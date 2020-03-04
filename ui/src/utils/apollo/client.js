import { InMemoryCache } from 'apollo-boost'
import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import everestMutations from 'everest-mutations'

import { createMutations, createMutationsLink } from '@graphprotocol/mutations'

const networkURI = process.env.GATSBY_NETWORK_URI
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
        throw Error('Please install metamask')
      }

      await ethereum.enable()
      return window.web3.currentProvider // TODO: pass the right provider
    },
    ipfs: ipfsURI,
  },
})

const queryLink = createHttpLink({
  uri: `${networkURI}/subgraphs/name/graphprotocol/everest`,
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
