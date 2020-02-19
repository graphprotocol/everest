import { InMemoryCache } from 'apollo-boost'
import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
//import tokenRegistryMutations from 'token-registry-mutations'
//import { createMutations, createMutationsLink } from '@graphprotocol/mutations'

const networkURI = process.env.GATSBY_NETWORK_URI
// const ipfsURI = process.env.GATSBY_IPFS_HTTP_URI

// const mutations = createMutations({
//   mutations: {
//     resolvers: tokenRegistryMutations.resolvers,
//     config: tokenRegistryMutations.config,
//     stateBuilder: tokenRegistryMutations.stateBuilder,
//   },
//   subgraph: 'everest',
//   node: ipfsURI,
//   config: {
//     ethereum: async () => {
//       //TODO: support multiple wallets
//       return window.web3.currentProvider
//     },
//     ipfs: ipfsURI,
//   },
// })

const queryLink = createHttpLink({
  uri: `${networkURI}/subgraph/graphprotocol/everest`,
})

// const mutationLink = createMutationsLink({ mutations })

// const link = split(
//   ({ query }) => {
//     const node = getMainDefinition(query)
//     return node.kind === 'OperationDefinition' && node.operation === 'mutation'
//   },
//   mutationLink,
//   queryLink
// )

const client = new ApolloClient({
  link: queryLink,
  cache: new InMemoryCache(),
})

export default client