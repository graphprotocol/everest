/** @jsx jsx */
import { useState, Fragment, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect-connector'
import { walletExists, getAddress } from '../../services/ethers'
import wallets from '../../connectors/wallets'
import { walletconnect } from '../../connectors'

import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

import QRCodeData from './QRCodeData'
import Divider from '../Divider'

import Close from '../../images/close.svg'
import Arrow from '../../images/arrow.svg'

const Modal = ({ children, showModal, closeModal }) => {
  const { account, activate } = useWeb3React()

  // TODO: refactor this logic
  const [walletError, setWalletError] = useState(false)
  const [walletConnector, setWalletConnector] = useState(null)
  const [showAccountView, setShowAccountView] = useState(false)
  const [showPendingView, setShowPendingView] = useState(false)
  const [showWalletsView, setShowWalletsView] = useState(true)
  const [uri, setUri] = useState('')
  const [walletEnabled, setWalletEnabled] = useState(false)

  // TODO: reset the view to the main wallet selection view

  // set up uri listener for walletconnect
  useEffect(() => {
    if (walletExists()) {
      setWalletEnabled(true)
    }
    const activateWalletConnect = uri => {
      setUri(uri)
    }
    walletconnect.on(URI_AVAILABLE, activateWalletConnect)
    return () => {
      walletconnect.off(URI_AVAILABLE, activateWalletConnect)
    }
  }, [])

  const handleWalletActivation = async wallet => {
    setWalletConnector(wallet.connector)
    if (wallet.name === 'MetaMask') {
      if (walletExists()) {
        if (getAddress()) {
          // make a contract call to add a user, and update navigation (refresh the page)
        }
      } else {
        return window.open('https://metamask.io/', '_blank')
      }
    }
    if (wallet.name !== 'MetaMask') {
      setShowPendingView(true)
      setShowWalletsView(false)
    }
    activate(wallet.connector, undefined, true)
      .catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(wallet.connector)
        } else {
          console.error(`Error activating the wallet ${wallet.name}: `, error)
          setWalletError(true)
        }
      })
      .then(async () => {
        // TODO: make a call to the smart contract to add a user - check with Dave
        await setShowAccountView(true)
        if (wallet.connector !== walletconnect) {
          closeModal()
        }
      })
  }

  const handleGoBack = () => {
    setShowPendingView(false)
    setShowWalletsView(true)
  }

  return (
    <div>
      {children}
      <Dialog
        isOpen={showModal}
        onDismiss={closeModal}
        aria-label="Connect to a wallet dialog"
        sx={{
          position: 'relative',
          maxWidth: '660px',
          width: '100%',
          padding: 7,
        }}
      >
        {showPendingView && !showWalletsView && (
          <Arrow
            onClick={handleGoBack}
            sx={{
              position: 'absolute',
              left: 5,
              top: 5,
              fill: '#bebebe',
              cursor: 'pointer',
              transform: 'rotate(180deg)',
            }}
          />
        )}
        <Close
          onClick={closeModal}
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            fill: '#bebebe',
            cursor: 'pointer',
          }}
        />
        {!walletError &&
        walletConnector === walletconnect &&
        !showWalletsView ? (
          account && showAccountView ? (
            <Grid>
              <Styled.p>You are logged in</Styled.p>
              <Styled.p>{account}</Styled.p>
            </Grid>
          ) : (
            <QRCodeData size={240} uri={uri} />
          )
        ) : (
          <Fragment>
            <Styled.h2>Sign in</Styled.h2>
            <Styled.h6>Connect to a Wallet</Styled.h6>
            <Divider mt={6} mb={6} />
            {Object.keys(wallets).map(key => {
              const wallet = wallets[key]
              return (
                <Grid
                  key={wallet.name}
                  columns={2}
                  gap={2}
                  sx={gridStyles}
                  onClick={() => handleWalletActivation(wallet)}
                >
                  <Box>
                    <img
                      src={`/${wallet.icon}`}
                      sx={iconStyles}
                      alt="Wallet icon"
                    />
                  </Box>
                  <Box>
                    <Styled.h5 sx={{ color: 'secondary' }}>
                      {!walletEnabled && wallet.name === 'MetaMask'
                        ? 'Install MetaMask '
                        : wallet.name}

                      <Arrow sx={{ ml: 1, fill: 'secondary' }} />
                    </Styled.h5>
                    <p sx={{ variant: 'text.displaySmall' }}>
                      {wallet.description}
                    </p>
                  </Box>
                </Grid>
              )
            })}
          </Fragment>
        )}
      </Dialog>
    </div>
  )
}

const gridStyles = {
  gridTemplateColumns: 'min-content 1fr',
  alignItems: 'center',
  padding: '16px',
  mt: 4,
  cursor: 'pointer',
}

const iconStyles = {
  height: '44px',
  width: '44px',
  objectFit: 'contain',
  mr: 3,
}

export default Modal
