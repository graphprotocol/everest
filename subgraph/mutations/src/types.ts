//TODO: Args are any by default in graphQL, do we really need these interfaces?

export interface EditProjectArgs {
  projectId: string
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

export interface AddProjectArgs {
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

export interface RemoveProjectArgs {
  projectId: string
}

export interface TransferOwnershipArgs {
  projectId: string
  newOwnerAddress: string
}

export interface DelegateOwnershipArgs {
  projectId: string
  delegateAddress: string
}

export interface ChallengeProjectArgs {
  challengingProjectAddress: string
  challengedProjectAddress: string
  details: {
    description: string
  }
}

export interface VoteChallengeArgs {
  challengeId: string
  voteChoice: Array<string>
  voters: Array<string>
}

export interface ResolveChallengeArgs {
  challengeId: string
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
  removeVotes: number
  keepVotes: number
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
  No,
}
