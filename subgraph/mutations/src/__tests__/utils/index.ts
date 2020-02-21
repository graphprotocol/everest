import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ethers } from 'ethers'
import { createMutations, createMutationsLink } from '@graphprotocol/mutations'

const IpfsClient = require('ipfs-http-client')

const infuraProvider = new ethers.providers.InfuraProvider('ropsten')
const provider = ethers.Wallet.fromMnemonic(
  'myth like bonus scare over problem client lizard pioneer submit female collect',
).connect(infuraProvider).provider

export const getFromIpfs = async (ipfs: any, hash: string) => {
  let result: string

  for await (const returnedValue of ipfs.get(`/ipfs/${hash}`)) {
    for await (const content of returnedValue.content as Buffer) {
      result = content.toString()
    }
  }

  return result
}

export const ipfsClient = new IpfsClient({ host: 'localhost', port: '5001' })

export const createApolloClient = mutationsModule => {
  const mutations = createMutations({
    mutations: mutationsModule,
    subgraph: '',
    node: '',
    config: {
      ethereum: provider,
      ipfs: 'http://localhost:5001',
    },
  })

  const link = createMutationsLink({ mutations })

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })
}
