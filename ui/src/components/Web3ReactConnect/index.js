import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useEagerConnect, useInactiveListener } from '../../utils/hooks'

const Web3ReactConnect = ({ children }) => {
  const [activatingConnector, setActivatingConnector] = useState()
  const { connector } = useWeb3React()

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // eagerly connect to the injected Ethereum provider (if it exists & has granted access)
  const triedEager = useEagerConnect()

  useInactiveListener(!triedEager || !!activatingConnector)
  return children
}

export default Web3ReactConnect
