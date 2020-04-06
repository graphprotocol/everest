/** @jsx jsx */
import { useState, Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect-connector'
import { isMobile } from 'react-device-detect'

import { walletExists } from '../../services/ethers'
import wallets from '../../connectors/wallets'
import { walletconnect } from '../../connectors'
import { useAccount } from '../../utils/hooks'
import { getAddress } from '../../services/ethers'

import QRCodeData from './QRCodeData'
import Divider from '../Divider'
import Close from '../../images/close.svg'
import Arrow from '../../images/arrow.svg'

const Modal = ({ children, showModal, closeModal }) => {
  const { activate } = useWeb3React()
  const { account } = useAccount()

  // TODO: Add wallet error
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [showAccountView, setShowAccountView] = useState(false)
  const [showPendingView, setShowPendingView] = useState(false)
  const [showWalletsView, setShowWalletsView] = useState(true)
  const [uri, setUri] = useState('')
  const [userAccount, setUserAccount] = useState(account)
  const [isWalletEnabled, setIsWalletEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== undefined) {
      const storage = window.localStorage.getItem('WALLET_CONNECTOR')
      if (!account && storage) {
        const walletConnector = JSON.parse(storage)
        if (walletConnector && walletConnector.accounts) {
          setUserAccount(walletConnector.accounts[0])
        }
      }
    }
  }, [])

  // set up uri listener for walletconnect
  useEffect(() => {
    if (walletExists()) {
      setIsWalletEnabled(true)
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
    setSelectedWallet(wallet)
    if (wallet.name === 'MetaMask') {
      const mmAccount = await getAddress()
      if (await walletExists()) {
        if (mmAccount) {
          setShowWalletsView(false)
          setShowAccountView(true)
          setUserAccount(mmAccount)

          const connnectData = JSON.stringify({
            name: wallet.type,
            accounts: [mmAccount],
          })
          if (typeof window !== undefined && mmAccount) {
            window.localStorage.setItem('WALLET_CONNECTOR', connnectData)
          }
          return
        }
      } else {
        return window.open('https://metamask.io/', '_blank')
      }
    } else if (wallet.name !== 'MetaMask') {
      setShowPendingView(true)
      setShowWalletsView(false)
    }
    activate(wallet.connector, undefined, true)
      .catch(error => {
        if (error instanceof UnsupportedChainIdError) {
          activate(wallet.connector)
        } else {
          console.error(`Error activating the wallet ${wallet.name}: `, error)
        }
      })
      .then(async () => {
        setShowWalletsView(false)
        setShowAccountView(true)

        const provider = await wallet.connector.getProvider()
        const address = provider._addresses
          ? provider._addresses[0]
          : provider.accounts
          ? provider.accounts[0]
          : provider.selectedAddress
        setUserAccount(address)
        if (typeof window !== undefined && address) {
          const connnectData = JSON.stringify({
            name: wallet.type,
            accounts: [address],
          })
          window.localStorage.setItem('WALLET_CONNECTOR', connnectData)
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
          px: [3, 7, 7],
          py: [5, 7, 7],
          boxShadow:
            '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
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
        {!showWalletsView ? (
          userAccount && showAccountView ? (
            <Grid>
              <Styled.p>You are logged in with {selectedWallet.name}</Styled.p>
              <Styled.p>{userAccount}</Styled.p>
            </Grid>
          ) : (
            <QRCodeData size={240} uri={uri} />
          )
        ) : (
          <Fragment>
            <Box sx={{ px: [4, 0, 0] }}>
              <Styled.h2>Sign in</Styled.h2>
              <Styled.h6>Connect to a Wallet</Styled.h6>
            </Box>
            <Divider mt={6} mb={6} />
            {Object.keys(wallets).map(key => {
              const wallet = wallets[key]
              if (isMobile && wallet.name === 'MetaMask') return null
              return (
                <Grid
                  key={wallet.name}
                  columns={2}
                  gap={2}
                  sx={gridStyles}
                  onClick={() => {
                    handleWalletActivation(wallet)
                  }}
                >
                  <Box>
                    <img src={wallet.icon} sx={iconStyles} alt="Wallet icon" />
                  </Box>
                  <Box>
                    <Styled.h5
                      sx={{
                        color: 'secondary',
                        fontSize: ['1.25rem', '1.5rem', '1.5rem'],
                      }}
                    >
                      {isMobile && wallet.mobileName
                        ? wallet.mobileName
                        : !isWalletEnabled && wallet.name === 'MetaMask'
                        ? 'Install MetaMask '
                        : wallet.name}
                      {!isMobile && <Arrow sx={{ ml: 1, fill: 'secondary' }} />}
                    </Styled.h5>
                    {!isMobile && (
                      <p sx={{ variant: 'text.small' }}>{wallet.description}</p>
                    )}
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
  transition: 'all 0.2s ease',
  svg: {
    transition: 'all 0.2s ease',
  },
  '&:hover': {
    h5: {
      color: 'linkHover',
    },
    svg: {
      transition: 'all 0.2s ease',
      fill: 'linkHover',
      marginLeft: 3,
    },
  },
}

const iconStyles = {
  height: '44px',
  width: '44px',
  verticalAlign: 'middle',
  objectFit: 'contain',
  mr: 3,
}

Modal.propTypes = {
  children: PropTypes.any,
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
}

export default Modal
