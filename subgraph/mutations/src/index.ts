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

// State Payloads + Events + StateBuilder
// TODO: Which custom events/reducers will we use? Will we use them at all?
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

// TODO: Best way to get ABIs?
async function getContract(context: Context) { }

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

  //TODO: are we sending metadata hash through state.dispatch?

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