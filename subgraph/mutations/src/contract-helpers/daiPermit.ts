import { ethers } from 'ethers'

const addresses = require('everest-contracts/addresses.json')

//////////////////////////
//////// DAI utils ///////
//////////////////////////

export const config = {
  offChainDataName: 'ProjectData',
  maxValidity: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  daiContractRopsten: addresses.ropsten.dai,
  daiContractMainnet: addresses.mainnet.dai,
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
  } else if (provider._web3Provider.isWalletConnect) {
    const msgParams = [
      { name: 'holder', type: 'address', value: message.holderAddress },
      { name: 'spender', type: 'address', value: message.spender },
      { name: 'nonce', type: 'uint256', value: message.nonce },
      { name: 'expiry', type: 'uint256', value: message.expiry },
      { name: 'allowed', type: 'bool', value: message.allowed },
    ]
    sig = await provider.send('eth_signTypedData', [msgParams, signerAddr], signerAddr)
  } else {
    console.log('Unknown wallet. Trying the same method as metamask')
    sig = await provider.send('eth_signTypedData_v3', [
      signerAddr,
      JSON.stringify(typedData),
    ])
  }
  return sig
}

export const daiPermit = async (holder, spenderAddress, daiContract, ethereum) => {
  let daiAddress
  if (ethereum._network.chainId == 1) {
    daiAddress = config.daiContractMainnet
  } else if (ethereum._network.chainId == 3) {
    daiAddress = config.daiContractRopsten
  }

  const holderAddress = holder
  const nonce = (await daiContract.nonces(holderAddress)).toString()
  const domain = {
    name: 'Dai Stablecoin',
    version: '1',
    chainId: String(ethereum._network.chainId),
    verifyingContract: daiAddress,
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
