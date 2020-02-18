//TODO: Args are any by default in graphQL, do we really need these interfaces?

export interface editProjectArgs{
  id: string
  name: string
  description: string
  avatar: string
  image: string
  website: string
  github: string
  twitter: string
  isRepresentative: boolean
  categories: Array<any>
}

export interface addProjectArgs{
  id: string
  name: string
  description: string
  avatar: string
  image: string
  website: string
  github: string
  twitter: string
  isRepresentative: boolean
  categories: Array<Category>
}

export interface removeProjectArgs{
  projectId: string
}

interface Category {
  id: string
  description: string
  slug: string
  projects: Project[]
  subcategories: Category[]
  parentCategory: Category
}

interface Project {
  id: string
  name: string
  description: string
  website: string
  twitter: string
  github: string
  avatar: string
  image: string
  categories: Category[]
  isRepresentative: boolean
  owner: User
  currentChallenge: Challenge
  pastChallenges: Challenge[]
  membershipStartTime: number
  delegates: string[]
  delegateValidities: number[]
  totalVotes: number
  votes: Vote[]
}

interface Challenge {
  id: string
  description: string
  endTime: number
  votesFor: number
  votesAgainst: number
  project: Project
  owner: string
  votes: Vote[]
  resolved: boolean
}

interface User {
  id: string
  name: string
  bio: string
  projects: Project[]
  challenges: Challenge[]
  votes: Project[]
}

interface Vote {
  id: string
  voter: Project
  challenge: Challenge
  choice: Choice
  weight: number
}

enum Choice {
  Null,
  Yes,
  No
}