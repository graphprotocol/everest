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

  query everestProject($projectId: ID!, $blockHash: String!) {
    project(id: $projectId, block: { hash: $blockHash }) {
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

  query everestChallenge($challengeId: ID!, $blockHash: String!) {
    challenge(id: $challengeId, block: { hash: $blockHash }) {
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
