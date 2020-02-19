import { ethers, utils } from 'ethers'

export const walletExists = () => {
  if (typeof window !== undefined) {
    return window.web3 || window.ethereum
  }
}

export const getAddress = async () => {
  let address = null
  if (window.ethereum !== undefined) {
    address = window.ethereum.selectedAddress
  } else if (window.web3 !== undefined) {
    const accounts = await window.web3.listAccounts()
    address = accounts[0]
  }
  return address
}

export const connectAccounts = async () => {
  let accounts = []
  if (window.ethereum !== undefined) {
    accounts = window.ethereum.enable()
  } else if (window.web3 !== undefined) {
    accounts = await window.web3.listAccounts()
  }
  return accounts
}

// TODO: change the event to chainChanged or networkChanged in 2020
// https://medium.com/metamask/no-longer-reloading-pages-on-network-change-fbf041942b44
export const metamaskAccountChange = callback => {
  if (typeof window.ethereum !== undefined && window.ethereum !== undefined) {
    window.ethereum.on('accountsChanged', accounts => {
      callback && callback(accounts)
    })
  }
}

export function getProvider() {
  let provider
  if (typeof window !== undefined) {
    provider = window.web3.currentProvider
      ? new ethers.providers.Web3Provider(window.web3.currentProvider)
      : window.web3
  }
  return provider
}

// connect to any contract with signer
export function getContract(address, ABI, library, account) {
  let signer
  const provider = window.web3.currentProvider
    ? new ethers.providers.Web3Provider(window.web3.currentProvider)
    : window.web3

  if (!library) {
    signer = provider.getSigner(0)
  } else {
    library.getSigner(account)
  }
  return new ethers.Contract(address, ABI, signer)
}

export const overrides = {
  gasLimit: 1000000,
  gasPrice: utils.parseUnits('1.0', 'gwei'),
}
