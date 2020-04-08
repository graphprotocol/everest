import {
  EventPayload,
  MutationContext,
  MutationResolvers,
  MutationState,
  StateBuilder,
} from '@graphprotocol/mutations'
import { ethers, utils } from 'ethers'
import { Transaction } from 'ethers/utils'
import { AsyncSendable, Web3Provider } from 'ethers/providers'
import ipfsHttpClient from 'ipfs-http-client'

import { sleep, uploadToIpfs, queryMap } from './utils'

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

import {
  applySignedWithAttribute,
  applySignedWithAttributeAndPermit,
  overrides,
  OFFCHAIN_DATANAME,
  VALIDITY_TIMESTAMP,
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

const queryGraphNode = async (
  context: Context,
  entity: string,
  id: string,
  hash: string,
) => {
  const { client } = context

  if (!client) {
    return null
  }

  if (!queryMap[entity]) {
    throw new Error(`No query found for entity '${entity}'`)
  }

  let result

  // TODO: this needs to be tested
  while (!result) {
    try {
      const { data, error } = await client.query({
        query: queryMap[entity](id, hash),
      })
      if (data) {
        result = data
      }
    } catch (err) {
      if (err.message.includes('no block with that hash found')) {
        await sleep(500)
      }
    }
  }

  return result
}

const sendTransaction = async (tx: Promise<Transaction>) => {
  try {
    const result = await tx
    return result as any
  } catch (error) {
    console.error(error)
    throw error
  }
}

const abis = {
  Context: require('everest-contracts/abis/Context.json').abi,
  Dai: require('everest-contracts/abis/Dai.json').abi,
  EthereumDIDRegistry: require('everest-contracts/abis/EthereumDIDRegistry.json').abi,
  LibNote: require('everest-contracts/abis/LibNote.json').abi,
  Ownable: require('everest-contracts/abis/Ownable.json').abi,
  Registry: require('everest-contracts/abis/Registry.json').abi,
  ReserveBank: require('everest-contracts/abis/ReserveBank.json').abi,
  SafeMath: require('everest-contracts/abis/SafeMath.json').abi,
  Everest: require('everest-contracts/abis/Everest.json').abi,
}

const addresses = require('everest-contracts/addresses.json')

const addressMap = {
  Dai: 'dai',
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
  // When running on ganache, networkName is dev or unknown
  if (networkName === 'dev' || networkName === 'unknown') {
    networkName = 'ganache'
  }

  // We look for the chainID when figuring out the network of ropsten or mainnet
  if (network.chainId === 1) {
    networkName = 'mainnet'
  } else if (network.chainId === 3) {
    networkName = 'ropsten'
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

const daiBalance = async (_: any, args: any, context: Context) => {
  const daiContract = await getContract(context, 'Dai')
  const balance = await daiContract.balanceOf(args.account)
  const formattedBalance = ethers.utils.formatUnits(balance, 18)
  return formattedBalance
}

const addProject = async (_: any, args: AddProjectArgs, context: Context) => {
  const { ethereum, ipfs } = context.graph.config

  const metadata = Buffer.from(JSON.stringify(args))

  const ipfsHash = await uploadToIpfs(ipfs, metadata)

  const owner = await ethereum.getSigner().getAddress()

  const member = await ethers.Wallet.createRandom().connect(ethereum)

  const memberSigningKey = new utils.SigningKey(member.privateKey)

  const everestContract = await getContract(context, 'Everest')

  const ethereumDIDRegistryContract = await getContract(context, 'EthereumDIDRegistry')

  const daiContract = await getContract(context, 'Dai')

  const permitBalance = await daiContract.allowance(owner, everestContract.address)
  // If it is wallet link, we do a direct approval of Everest to transfer users dai
  const eth: any = ethereum // cast to any because it thinks it is an Ethers object
  if (eth.provider.isWalletLink) {
    if (permitBalance._hex == '0x00')
      await daiContract.approve(
        everestContract.address,
        '1000000000000000000000',
        await overrides('approve', null),
      )
  }

  let transaction
  // If allowance is zero and we are on metamask, we can ask for signature
  if (permitBalance._hex == '0x00' && eth.provider._metamask) {
    transaction = await sendTransaction(
      applySignedWithAttributeAndPermit(
        member,
        memberSigningKey,
        owner,
        ipfsHash,
        everestContract,
        ethereumDIDRegistryContract,
        daiContract,
        ethereum,
      ),
    )
    // Otherwise, permit is maxed out, or we approved DAI with wallet link
  } else {
    transaction = await sendTransaction(
      applySignedWithAttribute(
        member,
        memberSigningKey,
        owner,
        ipfsHash,
        everestContract,
        ethereumDIDRegistryContract,
      ),
    )
  }

  return transaction
    .wait()
    .then(async (tx: any) => {
      let projectId
      if (tx.events.length == 4) {
        projectId = tx.events[0].args.member
      } else {
        projectId = tx.events[1].args.member
      }
      const { project } = await queryGraphNode(
        context,
        'project',
        projectId.toLowerCase(),
        tx.blockHash,
      )
      return project
    })
    .catch(err => console.error('Transaction error: ', err))
}

const removeProject = async (_: any, args: RemoveProjectArgs, context: Context) => {
  const { projectId } = args

  const everest = await getContract(context, 'Everest')

  const transaction = await sendTransaction(
    await everest.memberExit(projectId, await overrides('memberExit', null)),
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

  const ethereumDIDRegistry = await getContract(context, 'EthereumDIDRegistry')

  const transaction = await sendTransaction(
    await ethereumDIDRegistry.setAttribute(
      projectId,
      OFFCHAIN_DATANAME,
      hexIpfsHash,
      VALIDITY_TIMESTAMP,
      await overrides('setAttribute', null),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(
        context,
        'project',
        projectId,
        tx.blockHash,
      )
      return project
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const transferOwnership = async (
  _: any,
  args: TransferOwnershipArgs,
  context: Context,
) => {
  const { projectId, newOwnerAddress } = args

  const ethereumDIDRegistry = await getContract(context, 'EthereumDIDRegistry')

  const transaction = await sendTransaction(
    ethereumDIDRegistry.changeOwner(
      projectId,
      newOwnerAddress,
      await overrides('changeOwner', null),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(
        context,
        'project',
        projectId,
        tx.blockHash,
      )
      return project
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const delegateOwnership = async (
  _: any,
  args: DelegateOwnershipArgs,
  context: Context,
) => {
  const { projectId, delegateAddress } = args
  const delegateType =
    '0x6576657265737400000000000000000000000000000000000000000000000000' //"everest" in bytes32 + 50 zeroes
  const validity = 4733510400 //January 1st, 2120 in unix seconds

  const ethereumDIDRegistry = await getContract(context, 'EthereumDIDRegistry')

  const transaction = await sendTransaction(
    ethereumDIDRegistry.addDelegate(
      projectId,
      delegateType,
      delegateAddress,
      validity,
      await overrides('addDelegate', null),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { project } = await queryGraphNode(
        context,
        'project',
        projectId,
        tx.blockHash,
      )
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
    await everest.challenge(
      challengingProjectAddress,
      challengedProjectAddress,
      hexIpfsHash,
      await overrides('challenge', null),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const challengeId = tx.events[1].args.challengeID._hex
      const { challenge } = await queryGraphNode(
        context,
        'challenge',
        String(Number(challengeId)),
        tx.blockHash,
      )
      return challenge
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const voteChallenge = async (_: any, args: VoteChallengeArgs, context: Context) => {
  const { challengeId, voteChoice, voters } = args

  const everest = await getContract(context, 'Everest')

  const transaction = await sendTransaction(
    everest.submitVotes(
      challengeId,
      voteChoice,
      voters,
      await overrides('submitVotes', voters.length),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { challenge } = await queryGraphNode(
        context,
        'challenge',
        challengeId,
        tx.blockHash,
      )
      return challenge
    })
    .catch(err => {
      console.error('Transaction error: ', err)
      return false
    })
}

const resolveChallenge = async (_: any, args: ResolveChallengeArgs, context: Context) => {
  const { challengeId } = args

  const everest = await getContract(context, 'Everest')

  const transaction = await sendTransaction(
    await everest.resolveChallenge(
      challengeId,
      await overrides('resolveChallenge', null),
    ),
  )

  return transaction
    .wait()
    .then(async (tx: any) => {
      const { challenge } = await queryGraphNode(
        context,
        'challenge',
        challengeId,
        tx.blockHash,
      )
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
    daiBalance,
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
