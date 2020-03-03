import React, { createContext } from 'react'
import PropTypes from 'prop-types'
import { ethers } from 'ethers'
import { ApolloProvider } from '@apollo/react-hooks'
import { Web3ReactProvider } from '@web3-react/core'
import client from './src/utils/apollo/client'
import Web3ReactConnect from './src/components/Web3ReactConnect'

const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

export const ReactContext = createContext()

const wrapRootElement = ({ element }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <ReactContext.Provider>{element}</ReactContext.Provider>
      </ApolloProvider>
    </Web3ReactProvider>
  )
}

wrapRootElement.propTypes = {
  element: PropTypes.any,
}

const wrapPageElement = ({ element }) => (
  <Web3ReactConnect>{element}</Web3ReactConnect>
)

wrapPageElement.propTypes = {
  element: PropTypes.any,
  props: PropTypes.any,
}

export { wrapRootElement, wrapPageElement }
