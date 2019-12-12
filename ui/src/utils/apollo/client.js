import ApolloClient from 'apollo-boost'
import fetch from 'isomorphic-fetch'

const client = new ApolloClient({
  uri: 'https://eu1.prisma.sh/nevena-djaja/ui-mocks/dev',
  fetch: fetch
})

export default client
