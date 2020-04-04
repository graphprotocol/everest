import gql from 'graphql-tag'

export const uploadToIpfs = async (ipfs: any, data: any): Promise<string> => {
  let result

  try {
    for await (const returnedValue of ipfs.add(data)) {
      result = returnedValue
    }
  } catch (e) {
    console.log('ipfs error: ', e)
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
        isRepresentative
        totalVotes
        owner {
          id
        }
        delegates {
          id
        }
        currentChallenge {
          id
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
        description
        votes {
          id
        }
      }
    }
  `,
}
