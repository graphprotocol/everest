import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
  StateUpdater,
} from '@graphprotocol/mutations'
import { ethers } from 'ethers'
import { Transaction } from 'ethers/utils'
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'
import gql from 'graphql-tag'

import { EditProjectArgs, RemoveProjectArgs, AddProjectArgs } from './types'

interface CustomEvent extends EventPayload {
  myValue: string
}

type EventMap = {
  CUSTOM_EVENT: CustomEvent
}

interface State {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      myValue: '',
      myFlag: false,
    }
  },
  reducers: {
    CUSTOM_EVENT: async (state: MutationState<State>, payload: CustomEvent) => {
      return {
        myValue: 'true',
      }
    },
  },
}

type Config = typeof config

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    const url = new URL(endpoint)
    return ipfsHttpClient({
      protocol: url.protocol.replace(/[:]+$/, ''),
      host: url.hostname,
      port: url.port,
      'api-path': url.pathname.replace(/\/$/, '') + '/api/v0/',
    })
  },
}

type Context = MutationContext<Config, State, EventMap>

const uploadToIpfs = async (ipfs: any, data: any): Promise<string> => {
  let result

  for await (const returnedValue of ipfs.add(data)) {
    result = returnedValue
  }

  return result.path
}

const PROJECT_QUERY = gql`
  query everestProject($id: ID!) {
    project(where: { id: $id }) {
      id
      name
      description
      categories
      createdAt
      reputation
      isChallenged
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
    }
  }
`

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function queryProject(context: Context, projectId: string) {
  const { client } = context

  if (client) {
    for (let i = 0; i < 20; ++i) {
      const { data } = await client.query({
        query: PROJECT_QUERY,
        variables: {
          id: projectId,
        },
      })

      if (data === null) {
        await sleep(500)
      } else {
        return data.project
      }
    }
  }

  return null
}

async function sendTx(
  tx: Transaction,
  description: string,
  state: StateUpdater<State, EventMap>,
) {
  try {
    await state.dispatch('TRANSACTION_CREATED', {
      id: tx.hash,
      to: tx.to,
      from: tx.from,
      data: tx.data,
      amount: tx.value.toString(),
      network: `ethereum-${tx.chainId}`,
      description,
    })
    tx = await tx
    await state.dispatch('TRANSACTION_COMPLETED', { id: tx.hash, description: tx.data })
    return tx
  } catch (error) {
    await state.dispatch('TRANSACTION_ERROR', error)
  }
}

const abis = {
  Context: require('everest-contracts/build/contracts/Context.json').abi,
  Dai: require('everest-contracts/build/contracts/Dai.json').abi,
  EthereumDIDRegistry: require('everest-contracts/build/contracts/EthereumDIDRegistry.json')
    .abi,
  LibNote: require('everest-contracts/build/contracts/LibNote.json').abi,
  Ownable: require('everest-contracts/build/contracts/Ownable.json').abi,
  Registry: require('everest-contracts/build/contracts/Registry.json').abi,
  ReserveBank: require('everest-contracts/build/contracts/ReserveBank.json').abi,
  SafeMath: require('everest-contracts/build/contracts/SafeMath.json').abi,
  Everest: require('everest-contracts/build/contracts/Everest.json').abi,
}

const addresses = require('everest-contracts/addresses.json')

const addressMap = {
  Dai: 'mockDAI',
  EthereumDIDRegistry: 'ethereumDIDRegistry',
  ReserveBank: 'reserveBank',
  Everest: 'everest',
}

async function getContract(context: Context, contract: string) {
  const { ethereum } = context.graph.config

  const abi = abis[contract]

  if (!abi) {
    throw new Error(`Missing the ABI for '${contract}'`)
  }

  const network = await ethereum.getNetwork()
  let networkName = network.name

  if (networkName === 'dev' || networkName === 'unknown') {
    networkName = 'ganache'
  }

  const networkAddresses = addresses[networkName]

  if (!networkAddresses) {
    throw new Error(`Missing addresses for network '${networkName}'`)
  }

  const address = networkAddresses[addressMap[contract]]

  if (!address) {
    throw new Error(
      `Missing contract address for '${contract}' on network '${networkName}'`,
    )
  }

  const instance = new ethers.Contract(address, abi, ethereum.getSigner())
  instance.connect(ethereum)

  return instance
}

const uploadImage = async (_, { image }: any, context: Context) => {
  const { ipfs } = context.graph.config

  return await uploadToIpfs(ipfs, image)
}

const addProject = async (_, args: AddProjectArgs, context: Context) => {
  // const everest = await getContract(context)
  // Dave's code goes here...
}

const removeProject = async (_, args: RemoveProjectArgs, context: Context) => {
  const { projectId } = args

  // const everest = await getContract(context)
  // sendTx(everest.memberExit( ... ))

  return true
}

const editProject = async (_, args: EditProjectArgs, context: Context) => {
  const { ipfs } = context.graph.config

  const { id } = args

  const metadata = Buffer.from(JSON.stringify(args))

  const metadataHash = await uploadToIpfs(ipfs, metadata)

  // const everest = await getContract(context)
  // sendTx(everest.editOffChainDataSigned( ... ))

  return await queryProject(context, id)
}

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    uploadImage,
    addProject,
    removeProject,
    editProject,
  },
}

export default {
  resolvers,
  config,
  stateBuilder,
}

// Required Types
export { State, EventMap, CustomEvent }
