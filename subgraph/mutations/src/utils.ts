import gql from 'graphql-tag'
import { GraphQLObjectType, GraphQLString } from 'graphql'

export const uploadToIpfs = async (ipfs: any, data: any): Promise<string> => {
  let result

  for await (const returnedValue of ipfs.add(data)) {
    result = returnedValue
  }

  if (!result) throw new Error(`IPFS upload failed for data: '${data}'`)

  return result.path
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const queryMap = {
  project: (projectId: string, hash: string) => gql`
    query everestProject {
      project(id: "${projectId}", block: { hash: "${hash}" }) {
        id
        name
        description
        createdAt
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
        categories {
          id
          description
        }
      }
    }
  `,
  challenge: (challengeId: string, hash: string) => gql`
    query everestChallenge {
      challenge(id: "${challengeId}", block: { hash: "${hash}" }) {
        id
        name
        description
        createdAt
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
        categories {
          id
          description
        }
      }
    }
  `
}