import gql from 'graphql-tag'

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

export const PROJECT_QUERY = gql`
  query everestProject($projectId: ID!) {
    project(where: { id: $projectId }) {
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

export const CHALLENGE_QUERY = gql`
  query everestChallenge($challengeId: ID!) {
    challenge(where: { id: $challengeId }) {
      id
      ipfsHash
      description
      endTime
      votesFor
      votesAgainst
      project
      owner
      votes
      resolved
      createdAt
    }
  }
`
