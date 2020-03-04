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
      createdAt
      website
      twitter
      github
      image
      avatar
      totalVotes
      isRepresentative
      currentChallenge {
        id
        endTime
        owner
        description
        resolved
        votesFor
        votesAgainst
        votes {
          id
        }
      }
      owner {
        id
        name
      }
      categories {
        id
        name
      }
    }
  }
`

export const USER_PROJECTS_QUERY = gql`
  query everestUserProjects($id: ID!) {
    user(id: $id) {
      id
      name
      projects {
        id
        name
        avatar
      }
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query categories($parentCategory: String) {
    categories(where: { parentCategory: $parentCategory }) {
      id
      name
      description
      subcategories {
        id
      }
      parentCategory {
        id
      }
    }
  }
`

export const ALL_CATEGORIES_QUERY = gql`
  query categories {
    categories {
      id
      name
      description
      subcategories {
        id
      }
      parentCategory {
        id
      }
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
  query projects($orderBy: Project_orderBy, $orderDirection: OrderDirection) {
    projects(orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      name
      image
      description
      avatar
      createdAt
      isRepresentative
      currentChallenge {
        id
      }
      categories {
        id
        description
      }
    }
  }
`

export const TOTALS_QUERY = gql`
  query totals {
    totals {
      projectCount
    }
  }
`

export const PROFILE_QUERY = gql`
  query profile(
    $id: ID!
    $orderBy: Project_orderBy
    $orderDirection: OrderDirection
  ) {
    user(id: $id) {
      id
      projects(orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        name
        description
        avatar
        image
        website
        github
        twitter
        isRepresentative
        createdAt
        currentChallenge {
          id
        }
        categories {
          id
          name
        }
      }
      challenges {
        id
        createdAt
        project {
          id
          name
          description
          categories {
            id
            name
          }
        }
      }
      delegatorProjects {
        id
        name
        description
        createdAt
        currentChallenge {
          id
        }
        categories {
          id
          name
        }
      }
    }
  }
`

export const CHALLENGE_QUERY = gql`
  query challenge($id: ID!) {
    id
    description
    votes {
      id
    }
  }
`
