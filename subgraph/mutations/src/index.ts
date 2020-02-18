import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
  StateUpdater,
} from "@graphprotocol/mutations"
import { ethers } from 'ethers'
import { Transaction } from 'ethers/utils'
import {
  AsyncSendable,
  Web3Provider
} from "ethers/providers"
import ipfsHttpClient from 'ipfs-http-client'

import {
  sleep,
  uploadToIpfs,
  PROJECT_QUERY
} from './utils'
import { editProjectArgs, removeProjectArgs, addProjectArgs } from "./types"

interface CustomEvent extends EventPayload {
  myValue: string
}

type EventMap = {
  'CUSTOM_EVENT': CustomEvent
}

interface State {
  myValue: string
  myFlag: boolean
}

const stateBuilder: StateBuilder<State, EventMap> = {
  getInitialState(): State {
    return {
      myValue: '',
      myFlag: false
    }
  },
  reducers: {
    'CUSTOM_EVENT': async (state: MutationState<State>, payload: CustomEvent) => {
      return {
        myValue: 'true'
      }
    }
  }
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
  }
}

type Context = MutationContext<Config, State, EventMap>

async function queryProject(context: Context, projectId: string) {
  const { client } = context

  if (client) {
    for (let i = 0; i < 20; ++i) {
      const { data } = await client.query({
          query: PROJECT_QUERY,
          variables: {
            id: projectId,
          }
        }
      )

      if (data === null) {
        await sleep(500)
      } else {
        return data.project
      }
    }
  }

  return null
}

async function sendTx(tx: Transaction, description: string, state: StateUpdater<State, EventMap>) {
  try {
    await state.dispatch('TRANSACTION_CREATED', {
      id: tx.hash,
      to: tx.to,
      from: tx.from,
      data: tx.data,
      amount: tx.value.toString(),
      network: `ethereum-${tx.chainId}`,
      description
    })
    tx = await tx
    await state.dispatch('TRANSACTION_COMPLETED', { id: tx.hash, description: tx.data })
    return tx;
  } catch (error) {
    await state.dispatch('TRANSACTION_ERROR', error)
  }
}

// const abis = {
//   Context: require('token-registry-contracts/build/contracts/Context.json').abi,
//   dai: require('token-registry-contracts/build/contracts/dai.json').abi,
//   EthereumDIDRegistry: require('token-registry-contracts/build/contracts/EthereumDIDRegistry.json').abi,
//   LibNote: require('token-registry-contracts/build/contracts/LibNote.json').abi,
//   Ownable: require('token-registry-contracts/build/contracts/Ownable.json').abi,
//   Registry: require('token-registry-contracts/build/contracts/Registry.json').abi,
//   ReserveBank: require('token-registry-contracts/build/contracts/ReserveBank.json').abi,
//   SafeMath: require('token-registry-contracts/build/contracts/SafeMath.json').abi,
//   Everest: require('token-registry-contracts/build/contracts/Everest.json').abi,
//   MemberStruct: require('token-registry-contracts/build/contracts/MemberStruct.json').abi,
// }

// const addresses = require('token-registry-contracts/addresses.json')

// const addressMap = {
//   Dai: 'mockDAI',
//   EthereumDIDRegistry: 'ethereumDIDRegistry',
//   ReserveBank: 'reserveBank',
//   TokenRegistry: 'tokenRegistry',
// }

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

const addProject = async (_, args: addProjectArgs, context: Context) => {

  // const everest = await getContract(context)

  // Dave's code goes here...
}

const removeProject = async (_, args: removeProjectArgs, context: Context) => {

  const { projectId } = args

  // const everest = await getContract(context)
  // sendTx(everest.memberExit( ... ))

  return true

}

const editProject = async (_, args: editProjectArgs, context: Context) => {

  const { ipfs } = context.graph.config

  const { id } = args

  const metadata = Buffer.from( JSON.stringify( args ) )

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
    editProject
  }
}

export default {
  resolvers,
  config,
  stateBuilder
}

// Required Types
export {
  State,
  EventMap,
  CustomEvent
}