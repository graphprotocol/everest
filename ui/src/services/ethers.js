import { ethers } from 'ethers'

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
