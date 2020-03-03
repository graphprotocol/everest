import { gql } from 'apollo-boost'

export const REMOVE_PROJECT = gql`
  mutation removeProject($projectId: ID!) {
    removeProject(projectId: $projectId) @client
  }
`

export const ADD_PROJECT = gql`
  mutation addProject(
    $name: String!
    $description: String!
    $avatar: String
    $image: String
    $website: String
    $github: String
    $twitter: String
    $isRepresentative: Boolean
    $categories: any
  ) {
    addProject(
      name: $name
      description: $description
      avatar: $avatar
      image: $image
      website: $website
      github: $github
      twitter: $twitter
      isRepresentative: $isRepresentative
      categories: $categories
    ) @client {
      id
      name
      description
      avatar
      image
      website
      github
      twitter
      isRepresentative
      categories {
        id
        name
        description
      }
    }
  }
`

export const EDIT_PROJECT = gql`
  mutation editProject(
    $projectId: String!
    $name: String!
    $description: String!
    $avatar: String
    $image: String
    $website: String
    $github: String
    $twitter: String
    $isRepresentative: Boolean
    $categories: any
  ) {
    editProject(
      projectId: $projectId
      name: $name
      description: $description
      avatar: $avatar
      image: $image
      website: $website
      github: $github
      twitter: $twitter
      isRepresentative: $isRepresentative
      categories: $categories
    ) @client {
      id
      name
      description
      avatar
      image
      categories
    }
  }
`

export const CHALLENGE_PROJECT = gql`
  mutation challengeProject(
    $challengingProjectAddress: String!
    $challengedProjectAddress: String!
    $description: String!
  ) {
    challengeProject(
      challengingProjectAddress: $challengingProjectAddress
      challengedProjectAddress: $challengedProjectAddress
      details: { description: $description }
    ) @client
  }
`

export const RESOLVE_CHALLENGE = gql`
  mutation resolveChallenge($challengeId: ID!) {
    resolveChallenge(challengeId: $challengeId) @client {
      id
      description
    }
  }
`
