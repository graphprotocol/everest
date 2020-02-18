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
  categories: Array<any>
}

export interface removeProjectArgs{
  projectId: string
}