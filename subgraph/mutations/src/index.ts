import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
  StateUpdater,
} from '@graphprotocol/mutations'
import { ethers, utils } from 'ethers'
import { Transaction } from 'ethers/utils'
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'
import gql from 'graphql-tag'
import { URL } from 'url'

import { sleep, uploadToIpfs, PROJECT_QUERY } from './utils'
import {
  EditProjectArgs,
  RemoveProjectArgs,
  AddProjectArgs,
  ChallengeProjectArgs,
  TransferOwnershipArgs,
  DelegateOwnershipArgs,
  VoteChallengeArgs,
  ResolveChallengeArgs,
} from './types'

import { applySignedWithAttribute } from './contract-helpers/metatransactions'

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

const config = {
  ethereum: (provider: AsyncSendable): Web3Provider => {
    return new Web3Provider(provider)
  },
  ipfs: (endpoint: string) => {
    return ipfsHttpClient(endpoint)
  },
}

type Config = typeof config

type Context = MutationContext<Config, State, EventMap>

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
  const { ethereum, ipfs } = context.graph.config

  const metadata = Buffer.from(JSON.stringify(args))
  const ipfsHash = await uploadToIpfs(ipfs, metadata)

  const owner = await ethereum.getSigner().getAddress()
  const member = await ethers.Wallet.createRandom().connect(ethereum)

  const memberSigningKey = new utils.SigningKey(member.privateKey)

  const everestContract = await getContract(context, 'Everest')
  const ethereumDIDRegistryContract = await getContract(context, 'EthereumDIDRegistry')
  const daiContract = await getContract(context, 'Dai')

  let transaction
  try {
    transaction = await applySignedWithAttribute(
      member,
      memberSigningKey,
      owner,
      ipfsHash,
      everestContract,
      ethereumDIDRegistryContract,
      daiContract,
      ethereum,
    )
  } catch (err) {
    console.log(err)
    throw err
  }

  transaction
    .wait()
    .then(() => console.log('SUCCESSFUL ADD PROJECT'))
    .catch(err => console.error('TRansaction error: ', err))
}

const removeProject = async (_, args: RemoveProjectArgs, context: Context) => {
  const { projectId } = args

  const everest = await getContract(context, "Everest")

  let transaction
  try{
    transaction = await everest.memberExit(projectId, {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits('25.0', 'gwei'),
    })
  }catch(err){
    console.log(err)
    throw err
  }

  return transaction
    .wait()
    .then(() => true)
    .catch(err => {
      console.error('TRansaction error: ', err)
      return false
    })

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

const transferOwnership = async (_, args: TransferOwnershipArgs, context: Context) => {
  const { projectId, newOwnerAddress } = args

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry")

  let transaction
  try{
    transaction = await ethereumDIDRegistry.changeOwner(projectId, newOwnerAddress, {
      gasLimit: 1000000,
      gasPrice: ethers.utils.parseUnits('25.0', 'gwei'),
    })
  }catch(err){
    console.log(err)
    throw err
  }

  return transaction
    .wait()
    .then(() => true)
    .catch(err => {
      console.error('TRansaction error: ', err)
      return false
    })
}

const delegateOwnership = async (_, args: DelegateOwnershipArgs, context: Context) => {}

const challengeProject = async (_, args: ChallengeProjectArgs, context: Context) => {}

const voteChallenge = async (_, args: VoteChallengeArgs, context: Context) => {}

const resolveChallenge = async (_, args: ResolveChallengeArgs, context: Context) => {}

const resolvers: MutationResolvers<Config, State, EventMap> = {
  Mutation: {
    uploadImage,
    addProject,
    removeProject,
    editProject,
    transferOwnership,
    delegateOwnership,
    challengeProject,
    voteChallenge,
    resolveChallenge,
  },
}

export default {
  resolvers,
  config,
  stateBuilder,
}

// Required Types
export { State, EventMap, CustomEvent }
