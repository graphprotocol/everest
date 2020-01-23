import { ethers, utils } from 'ethers'
import { ipfsHexHash } from '../../services/ipfs'

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
