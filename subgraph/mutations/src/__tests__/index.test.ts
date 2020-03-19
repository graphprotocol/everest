import gql from 'graphql-tag'
import { BehaviorSubject } from 'rxjs'

import mutationsModule from '..'
import { getFromIpfs, ipfsClient, createApolloClient } from './utils'
import { AddProjectArgs } from '../types'

describe('Mutation Resolvers', () => {
  const observer = new BehaviorSubject<any>({} as any)

  const client = createApolloClient(mutationsModule)

  let publishedValue: any

  beforeAll(() => {
    observer.subscribe(value => {
      if (value) {
        publishedValue = value
      }
    })
  })

  describe('UploadImage', () => {
    it('Should upload given image to IPFS', async () => {
      const testImage = Buffer.from('test image')

      const {
        data: { uploadImage: hash },
      } = await client.mutate({
        mutation: gql`
          mutation uploadImage($image: File!) {
            uploadImage(image: $image) @client
          }
        `,
        variables: {
          image: testImage,
        },
      })

      const actual = await getFromIpfs(ipfsClient, hash)

      expect(actual).toEqual('test image')
    })

    it('Should throw error if upload was unsuccesful', async () => {
      const call = client.mutate({
        mutation: gql`
          mutation uploadImage($image: File!) {
            uploadImage(image: $image) @client
          }
        `,
        variables: {
          image: { a: 1 },
        },
      })

      expect(call).rejects.toThrowError()
    })
  })

  describe('AddProject', () => {
    it('Should add project', async () => {
      const args: AddProjectArgs = {
        name: 'Test name',
        description: 'Test description',
        avatar: '',
        image: '',
        website: '',
        github: '',
        twitter: '',
        isRepresentative: false,
        categories: [],
      }

      const {
        data: { addProject },
      } = await client.mutate({
        mutation: gql`
          mutation addProject(
            $name: String
            $description: String
            $avatar: String
            $image: String
            $website: String
            $github: String
            $twitter: String
            $isRepresentative: Boolean
            $categories: [Category]
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
        `,
        variables: args,
      })
    })
  })

  describe('EditProject', () => {})

  describe('RemoveProject', () => {})
})
