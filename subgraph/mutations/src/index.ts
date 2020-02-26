import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder
} from '@graphprotocol/mutations'
import { ethers, utils } from 'ethers'
import { DocumentNode } from 'graphql'
import { Transaction } from 'ethers/utils'
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'

import {
  sleep,
  uploadToIpfs,
  PROJECT_QUERY,
  CHALLENGE_QUERY
} from './utils'

import {
  EditProjectArgs,
  RemoveProjectArgs,
  AddProjectArgs,
  ChallengeProjectArgs,
  TransferOwnershipArgs,
  DelegateOwnershipArgs,
  VoteChallengeArgs,
  ResolveChallengeArgs
} from './types'

import {
  applySignedWithAttribute,
  overrides,
  OFFCHAIN_DATANAME,
  VALIDITY_TIMESTAMP
} from './contract-helpers/metatransactions'

import { ipfsHexHash } from './contract-helpers/ipfs'

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
  }
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

const queryGraphNode = async (context: Context, query: DocumentNode, variables: any) => {
  const { client } = context

  if (client) {
    const { data } = await client.query({
      query,
      variables,
    })

    if (data === null) {
      await sleep(500)
      await queryGraphNode(context, query, variables)
    } else {
      return data
    }
  }

  return null
}

const sendTransaction = async (tx: Promise<Transaction>) => {
  try {
    const result = await tx
    return result as any
  } catch (error) {
    console.log(error)
    throw error
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

const uploadImage = async (_: any, { image }: any, context: Context) => {
  const { ipfs } = context.graph.config

  return await uploadToIpfs(ipfs, image)
}

const addProject = async (_: any, args: AddProjectArgs, context: Context) => {
  const { ethereum, ipfs } = context.graph.config

  const { state } = context.graph

  const metadata = Buffer.from(JSON.stringify(args))
  const ipfsHash = await uploadToIpfs(ipfs, metadata)

  const owner = await ethereum.getSigner().getAddress()
  const member = await ethers.Wallet.createRandom().connect(ethereum)

  const memberSigningKey = new utils.SigningKey(member.privateKey)

  const everestContract = await getContract(context, 'Everest')
  const ethereumDIDRegistryContract = await getContract(context, 'EthereumDIDRegistry')
  const daiContract = await getContract(context, 'Dai')

  const transaction = await sendTransaction(applySignedWithAttribute(
    member,
    memberSigningKey,
    owner,
    ipfsHash,
    everestContract,
    ethereumDIDRegistryContract,
    daiContract,
    ethereum,
  )
  )

  return transaction
    .wait()
    .then(() => args)
    .catch(err => console.error('Transaction error: ', err))
}

const removeProject = async (_: any, args: RemoveProjectArgs, context: Context) => {
  const { projectId } = args

  const everest = await getContract(context, "Everest")

  const transaction = await sendTransaction(
    await everest.memberExit(projectId, overrides)
  )

  return transaction
    .wait()
    .then(() => true)
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })

}

const editProject = async (_: any, args: EditProjectArgs, context: Context) => {
  const { ipfs } = context.graph.config

  const { projectId } = args

  const metadata = Buffer.from(JSON.stringify(args))

  const metadataHash = await uploadToIpfs(ipfs, metadata)
  const hexIpfsHash = ipfsHexHash(metadataHash)

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry")

  const transaction = await sendTransaction(
    await ethereumDIDRegistry.setAttribute(projectId, OFFCHAIN_DATANAME, hexIpfsHash, VALIDITY_TIMESTAMP, overrides)
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(context, PROJECT_QUERY, { projectId, block: { hash: tx.blockHash } })
      return project
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const transferOwnership = async (_: any, args: TransferOwnershipArgs, context: Context) => {
  const { projectId, newOwnerAddress } = args

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry")

  const transaction = await sendTransaction(
    ethereumDIDRegistry.changeOwner(projectId, newOwnerAddress, overrides)
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(context, PROJECT_QUERY, { projectId, block: { hash: tx.blockHash } })
      return project
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const delegateOwnership = async (_: any, args: DelegateOwnershipArgs, context: Context) => {
  const { projectId, delegateAddress } = args
  const delegateType = '0x6576657265737400000000000000000000000000000000000000000000000000' //"everest" in bytes32 + 50 zeroes
  const validity = 4733510400 //January 1st, 2120 in unix seconds

  const ethereumDIDRegistry = await getContract(context, "EthereumDIDRegistry")

  const transaction = await sendTransaction(
    ethereumDIDRegistry.addDelegate(projectId, delegateType, delegateAddress, validity, overrides)
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(context, PROJECT_QUERY, { projectId, block: { hash: tx.blockHash } })
      return project
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const challengeProject = async (_: any, args: ChallengeProjectArgs, context: Context) => {
  const { ipfs } = context.graph.config
  const { challengedProjectAddress, challengingProjectAddress, details } = args

  const metadata = Buffer.from(JSON.stringify({ details }))
  const ipfsHash = await uploadToIpfs(ipfs, metadata)
  const hexIpfsHash = ipfsHexHash(ipfsHash)

  const everest = await getContract(context, 'Everest')

  const transaction = await sendTransaction(
    await everest.challenge(challengingProjectAddress, challengedProjectAddress, hexIpfsHash, overrides)
  )

  return transaction
    .wait()
    .then(() => args)
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const voteChallenge = async (_: any, args: VoteChallengeArgs, context: Context) => {
  const { challengeId, voteChoice, voters } = args

  const everest = await getContract(context, "Everest")

  const transaction = await sendTransaction(
    everest.submitVotes(challengeId, voteChoice, voters, overrides)
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { challenge } = await queryGraphNode(context, CHALLENGE_QUERY, { challengeId, block: { hash: tx.blockHash } })
      return challenge
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const resolveChallenge = async (_: any, args: ResolveChallengeArgs, context: Context) => {
  const { challengeId } = args

  const everest = await getContract(context, "Everest")

  const transaction = await sendTransaction(
    await everest.resolveChallenge(challengeId, overrides)
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { challenge } = await queryGraphNode(context, CHALLENGE_QUERY, { challengeId, block: { hash: tx.blockHash } })
      return challenge
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

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
