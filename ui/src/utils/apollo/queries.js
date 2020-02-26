import { gql } from 'apollo-boost'

// TODO: categories should be
// categories {
//   id
//   name
// }
export const PROJECT_QUERY = gql`
  query everestProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      categories
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

//ck3t926929y7w0922q88lnsww
export const USER_PROJECTS_QUERY = gql`
  query everestUserProjects($id: ID!) {
    user(where: { id: $id }) {
      id
      name
      projects {
        id
        name
        image
        categories
      }
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query categories {
    categories {
      id
      name
      description
    }
  }
`

export const CATEGORY_QUERY = gql`
  query category($id: ID!) {
    category(id: $id) {
      id
      name
      description
      subcategories {
        id
        name
        description
      }
    }
  }
`

export const PROJECTS_QUERY = gql`
  query projects {
    projects {
      id
      name
      image
      description
      avatar
      categories {
        id
        description
      }
    }
  }
`

export const PROFILE_QUERY = gql`
  query profile($id: ID!) {
    user(id: $id) {
      id
      projects {
        id
        name
        description
        avatar
        createdAt
        currentChallenge {
          id
        }
        categories {
          id
          description
        }
      }
      challenges {
        id
      }
    }
  }
`
