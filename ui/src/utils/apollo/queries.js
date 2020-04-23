import { gql } from 'apollo-boost'

export const PROJECT_QUERY = gql`
  query project($id: ID!) {
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
      delegates {
        id
      }
      currentChallenge {
        id
        endTime
        owner {
          id
          name
        }
        description
        resolved
        keepVotes
        removeVotes
        votes {
          id
        }
      }
      owner {
        id
      }
      categories {
        id
        name
        imageUrl
        parentCategory {
          id
          name
        }
        subcategories {
          id
          name
          imageUrl
          parentCategory {
            id
            name
          }
          subcategories {
            id
            name
            imageUrl
            parentCategory {
              id
              name
              parentCategory {
                id
                name
              }
            }
            subcategories {
              id
              name
              imageUrl
              parentCategory {
                id
                name
                parentCategory {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`

export const USER_PROJECTS_QUERY = gql`
  query everestUserProjects($id: ID!) {
    user(id: $id) {
      id
      projects {
        id
        name
        avatar
      }
      delegatorProjects {
        id
        name
        avatar
      }
    }
  }
`

export const CATEGORIES_QUERY = gql`
  query categories(
    $parentCategory: String
    $orderBy: Category_orderBy
    $orderDirection: OrderDirection
  ) {
    categories(
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { parentCategory: $parentCategory }
    ) {
      id
      name
      description
      imageUrl
      projectCount
      subcategories {
        id
        projects {
          id
        }
      }
      parentCategory {
        id
        name
      }
      projects {
        id
      }
    }
  }
`

export const ALL_CATEGORIES_QUERY = gql`
  query categories(
    $orderBy: Category_orderBy
    $orderDirection: OrderDirection
  ) {
    categories(
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { parentCategory: null }
    ) {
      id
      name
      description
      imageUrl
      projectCount
      parentCategory {
        id
        name
      }
      subcategories {
        id
        name
        imageUrl
        parentCategory {
          id
          name
        }
        subcategories {
          id
          name
          imageUrl
          parentCategory {
            id
            name
            parentCategory {
              id
              name
            }
          }
          subcategories {
            id
            name
            imageUrl
            parentCategory {
              id
              name
              parentCategory {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`

export const CATEGORY_QUERY = gql`
  query category(
    $id: ID!
    $orderBy: Category_orderBy
    $orderDirection: OrderDirection
  ) {
    category(id: $id) {
      id
      name
      description
      imageUrl
      projectCount
      subcategories(orderBy: $orderBy, orderDirection: $orderDirection) {
        id
        name
        description
        imageUrl
        projectCount
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
            name
          }
        }
      }
      parentCategory {
        id
        name
        parentCategory {
          id
          name
        }
      }
      projects {
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
          name
          description
          parentCategory {
            id
            name
          }
          subcategories {
            id
          }
        }
      }
    }
  }
`

export const PROJECTS_QUERY = gql`
  query projects(
    $orderBy: Project_orderBy
    $orderDirection: OrderDirection
    $where: Project_filter
    $first: Int
    $skip: Int
  ) {
    projects(
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
      first: $first
      skip: $skip
    ) {
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
        name
        description
        parentCategory {
          id
          name
        }
        subcategories {
          id
        }
      }
    }
  }
`

export const PROJECT_SEARCH = gql`
  query projectSearch($text: String) {
    projectSearch(text: $text) {
      id
      ipfsHash
      name
      avatar
      description
      categories {
        id
        name
        parentCategory {
          id
          name
        }
        subcategories {
          id
        }
      }
    }
  }
`

export const PROFILE_QUERY = gql`
  query profile(
    $id: ID!
    $orderBy: Project_orderBy
    $orderDirection: OrderDirection
    $where: Project_filter
  ) {
    user(id: $id) {
      id
      projects(
        orderBy: $orderBy
        orderDirection: $orderDirection
        where: $where
      ) {
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
        delegates {
          id
        }
        currentChallenge {
          id
        }
        categories {
          id
          name
          imageUrl
          parentCategory {
            id
            name
          }
          subcategories {
            id
            name
            imageUrl
            parentCategory {
              id
              name
            }
            subcategories {
              id
              name
              imageUrl
              parentCategory {
                id
                name
                parentCategory {
                  id
                  name
                }
              }
              subcategories {
                id
                name
                imageUrl
                parentCategory {
                  id
                  name
                  parentCategory {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
      delegatorProjects {
        id
        name
        description
        createdAt
        avatar
        currentChallenge {
          id
        }
        categories {
          id
          name
          parentCategory {
            id
            name
          }
          subcategories {
            id
          }
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

export const USER_CHALLENGES_QUERY = gql`
  query challenges($projects: [ID!], $endTime: Int) {
    challenges(where: { owner_in: $projects, endTime_lt: $endTime }) {
      id
      project {
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
    }
  }
`

export const EVEREST_QUERY = gql`
  query everests {
    everests {
      id
      projectCount
      categoriesCount
      reserveBankBalance
      claimedProjects
      challengedProjects
    }
  }
`
