/** @jsx jsx */
import { useState, Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { useWeb3React } from '@web3-react/core'

import { walletExists } from '../../services/ethers'
import wallets from '../../connectors/wallets'
import { useAccount } from '../../utils/hooks'
import { getAddress } from '../../services/ethers'

import QRCodeData from './QRCodeData'
import Divider from '../Divider'
import Close from '../../images/close.svg'
import Arrow from '../../images/arrow.svg'

const Modal = ({ children, showModal, closeModal }) => {
  const { activate } = useWeb3React()
  const { account } = useAccount()

  const VIEWS = {
    WALLETS: 'wallets',
    QRCODE: 'qrcode',
    ACCOUNT: 'account',
  }
  // TODO: Add wallet error
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [modalView, setModalView] = useState(VIEWS.WALLETS)
  const [userAccount, setUserAccount] = useState('')

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

  const handleWalletActivation = async wallet => {
    setSelectedWallet(wallet)
    if (wallet.name === 'MetaMask') {
      // if it's injected
      if (await walletExists()) {
        if (!(await getAddress())) {
          // if not signed in - show MM popup
          window.ethereum.enable()
        }
      } else {
        return window.open('https://metamask.io/', '_blank')
      }
    } else {
      setModalView(VIEWS.QRCODE)
    }

    // activate the connector
    activate(wallet.connector, undefined, true)
      .catch(error => {
        console.error(`Error activating the wallet ${wallet.name}: `, error)
      })
      .then(async () => {
        const provider = await wallet.connector.getProvider()
        const address = provider._addresses
          ? provider._addresses[0]
          : provider.selectedAddress

        setUserAccount(address)
        setModalView(VIEWS.ACCOUNT)

        // Store the data in the local storage
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
    setModalView(VIEWS.WALLETS)
  }

  const renderView = () => {
    if (userAccount && modalView === VIEWS.ACCOUNT && selectedWallet) {
      return (
        <Grid>
          <Styled.p>You are logged in with {selectedWallet.name}</Styled.p>
          <Styled.p>{userAccount}</Styled.p>
        </Grid>
      )
    } else if (modalView === VIEWS.QRCODE) {
      return <QRCodeData size={240} />
    } else {
      return (
        <Fragment>
          <Box sx={{ px: [4, 0, 0] }}>
            <Styled.h2>Sign in</Styled.h2>
            <Styled.h6>Connect to a Wallet</Styled.h6>
          </Box>
          <Divider mt={6} mb={6} />
          {Object.keys(wallets).map(key => {
            const wallet = wallets[key]
            return (
              <Grid
                key={wallet.name}
                columns={2}
                gap={2}
                sx={
                  wallet.type !== 'walletconnect'
                    ? {
                        ...gridStyles,
                        cursor: 'pointer',
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
                    : gridStyles
                }
                onClick={() => {
                  if (wallet.type !== 'walletconnect') {
                    handleWalletActivation(wallet)
                  }
                }}
              >
                <Box>
                  <img
                    src={`${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/${
                      wallet.icon
                    }`}
                    sx={iconStyles}
                    alt="Wallet icon"
                  />
                </Box>
                <Box>
                  <Styled.h5
                    sx={{
                      color:
                        wallet.type !== 'walletconnect'
                          ? 'secondary'
                          : 'blackFaded',
                      fontSize: ['1.25rem', '1.5rem', '1.5rem'],
                    }}
                  >
                    {wallet.name}
                    {wallet.type !== 'walletconnect' && (
                      <Arrow sx={{ ml: 1, fill: 'secondary' }} />
                    )}
                  </Styled.h5>
                  <p
                    sx={{
                      variant: 'text.small',
                      color:
                        wallet.type !== 'walletconnect'
                          ? 'primary'
                          : 'blackFaded',
                    }}
                  >
                    {wallet.description}
                  </p>
                </Box>
              </Grid>
            )
          })}
        </Fragment>
      )
    }
  }

  return (
    <div>
      {children}
      <Dialog
        isOpen={showModal}
        onDismiss={() => {
          if (modalView === VIEWS.ACCOUNT) {
            window.location.reload()
          }
          closeModal()
        }}
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
        {(modalView === VIEWS.ACCOUNT || modalView === VIEWS.QRCODE) && (
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
          onClick={() => {
            if (modalView === VIEWS.ACCOUNT) {
              window.location.reload()
            }
            closeModal()
          }}
          sx={{
            position: 'absolute',
            right: 5,
            top: 5,
            fill: '#bebebe',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              opacity: 0.64,
            },
          }}
        />
        {renderView()}
      </Dialog>
    </div>
  )
}

const gridStyles = {
  gridTemplateColumns: 'min-content 1fr',
  alignItems: 'center',
  padding: '16px',
  mt: 4,
  svg: {
    transition: 'all 0.2s ease',
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
