import { ethers } from 'ethers'

const addresses = require('everest-contracts/addresses.json')

//////////////////////////
//////// DAI utils ///////
//////////////////////////

export const config = {
  chainID: '3', // ROPSTEN ONLY, MUST BE CHANGED IF ON ANOTHER NETWORK
  offChainDataName: 'ProjectData',
  maxValidity: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  verifyingDAIContract: addresses.ropsten.mockDAI,
}

const domainSchema = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

const permitSchema = [
  { name: 'holder', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'nonce', type: 'uint256' },
  { name: 'expiry', type: 'uint256' },
  { name: 'allowed', type: 'bool' },
]

async function signPermit(provider, domain, message) {
  let signer = provider.getSigner()
  let signerAddr = await signer.getAddress()

  if (signerAddr.toLowerCase() !== message.holder.toLowerCase()) {
    throw `signPermit: address of signer does not match holder address in message`
  }

  if (message.nonce === undefined) {
    let tokenAbi = ['function nonces(address holder) view returns (uint)']

    let tokenContract = new ethers.Contract(domain.verifyingContract, tokenAbi, provider)

    let nonce = await tokenContract.nonces(signerAddr)

    message = { ...message, nonce: nonce.toString() }
  }

  let typedData = {
    types: {
      EIP712Domain: domainSchema,
      Permit: permitSchema,
    },
    primaryType: 'Permit',
    domain,
    message,
  }

  let sig

  if (provider._web3Provider._metamask != null) {
    sig = await provider.send('eth_signTypedData_v3', [
      signerAddr,
      JSON.stringify(typedData),
    ])
  } else if (provider._web3Provider.isWalletLink) {
    // Wallet link expects typedData to not be stringified
    sig = await provider.send('eth_signTypedData_v3', [signerAddr, typedData])
  } else {
    console.log('typedData: ', typedData)
    console.log('signerAddr: ', signerAddr)
    // We default trying with stringify
    sig = await provider.send('eth_signTypedData', [
      signerAddr,
      JSON.stringify(typedData),
    ])
    console.log('sig: ', sig)
  }

  return sig
}

export const daiPermit = async (holder, spenderAddress, daiContract, ethereum) => {
  const holderAddress = holder
  const nonce = (await daiContract.nonces(holderAddress)).toString()
  const domain = {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: config.chainID,
    verifyingContract: config.verifyingDAIContract,
  }

  const message = {
    holder: holderAddress,
    spender: spenderAddress,
    nonce: nonce,
    expiry: 0,
    allowed: true,
  }

  const sig = await signPermit(ethereum, domain, message)
  const splitSig = ethers.utils.splitSignature(sig)
  return splitSig
}
