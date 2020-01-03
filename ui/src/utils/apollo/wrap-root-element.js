import React from 'react'
import { ethers } from 'ethers'
import { ApolloProvider } from '@apollo/react-hooks'
import { Web3ReactProvider } from '@web3-react/core'
import client from './client'

const getLibrary = provider => {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

export const wrapRootElement = ({ element }) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <ApolloProvider client={client}>{element}</ApolloProvider>
  </Web3ReactProvider>
)
