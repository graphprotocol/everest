import { ethers, utils } from 'ethers'
import { keccak_256 } from 'js-sha3'
import fetch from 'isomorphic-fetch'

import { ipfsHexHash } from './ipfs'
import { daiPermit } from './daiPermit'

const ETHEREUM_DID_REGISTRY = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
export const DELEGATE_TYPE =
  '0x6576657265737400000000000000000000000000000000000000000000000000'
export const VALIDITY_TIMESTAMP = 3156895760
export const OFFCHAIN_DATANAME =
  '0x50726f6a65637444617461000000000000000000000000000000000000000000'

export const changeOwnerSignedData = (projectId, owner) => {
  return ethers.utils.solidityKeccak256(
    ['bytes1', 'bytes1', 'address', 'uint256', 'address', 'string', 'address'],
    ['0x19', '0x0', ETHEREUM_DID_REGISTRY, 0, projectId, 'changeOwner', owner],
  )
}

export const overrides = async (funcName, votesLength) => {
  const ethGast = await fetch('https://ethgasstation.info/json/ethgasAPI.json')
  const ethGasJson = await ethGast.json()
  const gasPrice = ethGasJson && ethGasJson.fast ? ethGasJson.fast / 10 : 10

  const safetyMultiplier = 1.75 // it failed at 1.5 in testing, so using 1.75
  const gasLimits = {
    addDelegate: 52237,
    applySigned: 245328, // for both applySigned and applySignedWithPermit
    approve: 43970,
    challenge: 291455,
    changeOwner: 36784,
    memberExit: 30540,
    // resolveChallenge has failed at 62684 likely a large voting can make this bigger. so 2x
    // at $170 ETH, and 10gwei, cost is about $0.10. Worth while for $1
    resolveChallenge: 62684 * 2,
    setAttribute: 33792,
    submitVotes: 102957 * votesLength, // for vote and submitVote
  }

  return {
    gasLimit: gasLimits[funcName] * safetyMultiplier,
    gasPrice: ethers.utils.parseUnits(gasPrice.toString(), 'gwei'),
  }
}

export const setAttributeData = (projectId, ipfsHash, offChainDataName) => {
  return utils.solidityKeccak256(
    [
      'bytes1',
      'bytes1',
      'address',
      'uint256',
      'address',
      'string',
      'bytes32',
      'bytes',
      'uint256',
    ],
    [
      '0x19',
      '0x0',
      ETHEREUM_DID_REGISTRY,
      0,
      projectId, // project address
      'setAttribute',
      offChainDataName,
      ipfsHexHash(ipfsHash),
      VALIDITY_TIMESTAMP,
    ],
  )
}

export const setDelegate = (projectId, delegateAddress, nonce) => {
  return utils.solidityKeccak256(
    [
      'bytes1',
      'bytes1',
      'address',
      'uint256',
      'address',
      'string',
      'bytes32',
      'bytes',
      'uint256',
    ],
    [
      '0x19',
      '0x0',
      ETHEREUM_DID_REGISTRY,
      nonce,
      projectId, // project address
      'addDelegate',
      DELEGATE_TYPE,
      delegateAddress,
      VALIDITY_TIMESTAMP,
    ],
  )
}

export const permitSignedData = (projectId, owner) =>
  utils.solidityKeccak256(
    ['bytes1', 'bytes1', 'address', 'address', 'uint256', 'uint256', 'bool'],
    [
      '0x19',
      '0x0',
      projectId,
      owner,
      1, // nonce always starts at 1
      0, // allowance never expires
      true, // to represent an infinite amount of allowance
    ],
  )

const stringToBytes32 = str => {
  const buffstr = Buffer.from(str).toString('hex')
  return buffstr + '0'.repeat(64 - buffstr.length)
}

const leftPad = (data, size = 64) => {
  if (data.length === size) return data
  return '0'.repeat(size - data.length) + data
}

const stripHexPrefix = str => {
  if (str.startsWith('0x')) {
    return str.slice(2)
  }
  return str
}

//////////////////////////
///// ERC 1056 utils /////
//////////////////////////

export const config = {
  offChainDataName: 'ProjectData',
  maxValidity: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
}

export const setAttribute = async (
  memberAddress,
  owner,
  metadataIpfsHash,
  ethDIDContract,
) => {
  const fromOwner = new ethers.Contract(
    ethDIDContract.address,
    ethDIDContract.interface,
    owner,
  )
  const tx = await fromOwner.setAttribute(
    memberAddress,
    '0x' + stringToBytes32(config.offChainDataName),
    Buffer.from(metadataIpfsHash, 'hex'),
    '0x' + config.maxValidity,
  )
  return tx
}

export const setAttributeSigned = async (
  newMember,
  owner,
  data,
  ethDIDContract,
  rawSigner,
) => {
  const memberAddress = await newMember.getAddress()
  const sig = await signDataDIDRegistry(
    memberAddress,
    owner,
    data,
    'setAttribute',
    ethDIDContract,
    rawSigner,
  )
  return sig
}

export const applySigned = async (newMember, owner, ethDIDContract, rawSigner) => {
  const newMemberAddress = await newMember.getAddress()
  const ownerAddress = owner

  const sig = await signDataDIDRegistry(
    newMemberAddress,
    newMember,
    Buffer.from('changeOwner').toString('hex') + stripHexPrefix(ownerAddress),
    'changeOwner',
    ethDIDContract,
    rawSigner,
  )
  return sig
}

export const signDataDIDRegistry = async (
  identity,
  signer,
  data,
  functionName,
  ethDIDContract,
  rawSigner,
) => {
  let nonce = await ethDIDContract.nonce(identity) // ** need to add 1 TODO*
  if (functionName == 'changeOwner') {
    nonce = 1
  }
  const paddedNonce = leftPad(Buffer.from([nonce], 64).toString('hex'))
  let dataToSign

  if (functionName == 'changeOwner') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity.toLowerCase()) +
      data
  } else if (functionName == 'setAttribute') {
    dataToSign =
      '1900' +
      stripHexPrefix(ethDIDContract.address) +
      paddedNonce +
      stripHexPrefix(identity.toLowerCase()) +
      data
  }

  const hash = Buffer.from(keccak_256(Buffer.from(dataToSign, 'hex')), 'hex')
  let splitSig = rawSigner.signDigest(hash)

  return {
    r: splitSig.r,
    s: splitSig.s,
    v: splitSig.v,
  }
}

export const applySignedWithAttribute = async (
  newMember,
  newMemberSigningKey,
  owner,
  metadataIpfsHash,
  everestContract,
  ethDIDContract,
) => {
  const ownerAddress = owner
  const memberAddress = await newMember.getAddress()

  // Get the signature for changing ownership on ERC-1056 Registry
  const applySignedSig = await applySigned(
    newMember,
    owner,
    ethDIDContract,
    newMemberSigningKey,
  )

  const metadataIpfsBytes = ipfsHexHash(metadataIpfsHash)

  const setAttributeData =
    Buffer.from('setAttribute').toString('hex') +
    stringToBytes32(config.offChainDataName) +
    stripHexPrefix(metadataIpfsBytes) +
    config.maxValidity

  // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
  const setAttributeSignedSig = await setAttributeSigned(
    newMember,
    owner,
    setAttributeData,
    ethDIDContract,
    newMemberSigningKey,
  )

  // Send all three meta transactions to TokenRegistry to be executed in one tx
  const tx = await everestContract.applySignedWithAttribute(
    memberAddress,
    [setAttributeSignedSig.v, applySignedSig.v],
    [setAttributeSignedSig.r, applySignedSig.r],
    [setAttributeSignedSig.s, applySignedSig.s],
    ownerAddress,
    '0x' + stringToBytes32(config.offChainDataName),
    metadataIpfsBytes,
    '0x' + config.maxValidity,
    await overrides('applySigned', null),
  )
  return tx
}

export const applySignedWithAttributeAndPermit = async (
  newMember,
  newMemberSigningKey,
  owner,
  metadataIpfsHash,
  everestContract,
  ethDIDContract,
  daiContract,
  ethereum,
) => {
  const ownerAddress = owner
  const memberAddress = await newMember.getAddress()

  // Get the signature for changing ownership on ERC-1056 Registry
  const applySignedSig = await applySigned(
    newMember,
    owner,
    ethDIDContract,
    newMemberSigningKey,
  )

  // Get the signature for permitting TokenRegistry to transfer DAI on users behalf
  const permitSig = await daiPermit(owner, everestContract.address, daiContract, ethereum)

  const metadataIpfsBytes = ipfsHexHash(metadataIpfsHash)

  const setAttributeData =
    Buffer.from('setAttribute').toString('hex') +
    stringToBytes32(config.offChainDataName) +
    stripHexPrefix(metadataIpfsBytes) +
    config.maxValidity

  // Get the signature for setting the attribute (i.e. Token data) on ERC-1056
  const setAttributeSignedSig = await setAttributeSigned(
    newMember,
    owner,
    setAttributeData,
    ethDIDContract,
    newMemberSigningKey,
  )

  // Send all three meta transactions to TokenRegistry to be executed in one tx
  const tx = await everestContract.applySignedWithAttributeAndPermit(
    memberAddress,
    [setAttributeSignedSig.v, applySignedSig.v, permitSig.v],
    [setAttributeSignedSig.r, applySignedSig.r, permitSig.r],
    [setAttributeSignedSig.s, applySignedSig.s, permitSig.s],
    ownerAddress,
    '0x' + stringToBytes32(config.offChainDataName),
    metadataIpfsBytes,
    '0x' + config.maxValidity,
    await overrides('applySigned', null),
  )

  return tx
}
