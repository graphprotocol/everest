import gql from 'graphql-tag'

export const uploadToIpfs = async (ipfs: any, data: any): Promise<string> => {
  let result

  for await (const returnedValue of ipfs.add(data)) {
    result = returnedValue
  }

  return result.path
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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