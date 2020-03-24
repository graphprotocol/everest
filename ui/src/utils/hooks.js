import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { getAddress, getProvider } from '../services/ethers'
import { injected } from '../connectors'

export function useWeb3React() {
  const context = useWeb3ReactCore()
  const contextNetwork = useWeb3ReactCore()

  return context.active ? context : contextNetwork
}

export function useAccount() {
  const { account: web3Account } = useWeb3ReactCore()
  const [account, setAccount] = useState('')
  useEffect(() => {
    async function accountAddress() {
      if (typeof window !== undefined && window.localStorage) {
        const storage = window.localStorage.getItem('WALLET_CONNECTOR')
        if (storage) {
          const walletConnector = JSON.parse(storage)
          if (walletConnector && walletConnector.accounts) {
            setAccount(walletConnector.accounts[0])
          }
        } else {
          web3Account ? setAccount(web3Account) : setAccount(await getAddress())
        }
      } else if (web3Account) {
        setAccount(web3Account)
      } else {
        setAccount(await getAddress())
      }
    }
    accountAddress()
  }, [web3Account, setAccount])

  return { account: account ? account.toLowerCase() : null, setAccount }
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

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore()

  useEffect(() => {
    const { ethereum } = window
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = chainId => {
        console.log('chainChanged', chainId)
        activate(injected)
      }

      const handleAccountsChanged = accounts => {
        console.log('accountsChanged', accounts)
        if (accounts.length > 0) {
          activate(injected)
        }
      }

      const handleNetworkChanged = networkId => {
        console.log('networkChanged', networkId)
        activate(injected)
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }

    return () => {}
  }, [active, error, suppress, activate])
}
