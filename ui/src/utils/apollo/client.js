import ApolloClient from 'apollo-boost'
import fetch from 'isomorphic-fetch'

const client = new ApolloClient({
  uri: 'https://api.staging.thegraph.com/subgraphs/name/graphprotocol/everest',
  fetch: fetch,
})

export default client
