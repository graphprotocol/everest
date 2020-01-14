import { gql } from 'apollo-boost'

// TODO: categories should be
// categories {
//   id
//   name
// }
export const PROJECT_QUERY = gql`
  query everestProject($id: ID!) {
    project(where: { id: $id }) {
      id
      name
      description
      categories
      createdAt
      reputation
      isChallenged
      website
      twitter
      github
      image
      avatar
      totalVotes
      owner {
        id
        name
      }
    }
  }
`
