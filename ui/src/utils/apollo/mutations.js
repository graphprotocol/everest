import { gql } from 'apollo-boost'

export const REMOVE_PROJECT = gql`
  mutation project($projectId: ID!) {
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
    ) @client
  }
`
