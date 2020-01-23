import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useMemo, useEffect, useState } from 'react'

import { getContract, getAddress, getProvider } from '../services/ethers'
import addresses from '../../constants/addresses.json'
import EVEREST_ABI from '../../constants/abis/Everest.json'
import ETHEREUM_DID_REGISTRY_ABI from '../../constants/abis/EthereumDIDRegistry.json'

export function useWeb3React() {
  const context = useWeb3ReactCore()
  const contextNetwork = useWeb3ReactCore()

  return context.active ? context : contextNetwork
}

export function useEverestContract() {
  const { library, account } = useWeb3ReactCore()
  return useMemo(() => {
    try {
      return getContract(
        addresses.ropsten.everest,
        EVEREST_ABI,
        library,
        account,
      )
    } catch (e) {
      return null
    }
  }, [library, account])
}

export function useEthereumDIDRegistry() {
  const { library, account } = useWeb3ReactCore()
  return useMemo(() => {
    try {
      return getContract(
        addresses.ropsten.ethereumDIDRegistry,
        ETHEREUM_DID_REGISTRY_ABI,
        library,
        account,
      )
    } catch (e) {
      return null
    }
  }, [library, account])
}

export function useAddress() {
  const { account } = useWeb3ReactCore()
  const [address, setAddress] = useState('')
  useEffect(() => {
    async function accountAddress() {
      if (account) {
        setAddress(account)
      } else {
        setAddress(await getAddress())
      }
    }
    accountAddress()
  }, [account])
  return [address, setAddress]
}

export function useProvider() {
  const { library } = useWeb3ReactCore()
  const [provider, setProvider] = useState('')
  useEffect(() => {
    async function web3Provider() {
      if (library) {
        setProvider(library.provider)
      } else {
        setProvider(await getProvider())
      }
    }
    web3Provider()
  }, [library])
  return [provider, setProvider]
}
