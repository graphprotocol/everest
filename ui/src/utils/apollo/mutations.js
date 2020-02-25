import { gql } from 'apollo-boost'

export const REMOVE_PROJECT = gql`
  mutation project($projectId: ID!) {
    removeProject(projectId: $projectId) @client
  }
`
