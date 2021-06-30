/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { useWeb3React } from '@web3-react/core'

import { metamaskAccountChange } from '../../services/ethers'
import { useAccount } from '../../utils/hooks'

import Link from '../../components/Link'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Menu from '../../components/Menu'
import Search from '../../components/Search'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'
import Bars from '../../images/bars.svg'
import Close from '../../images/close.svg'
import ThreeBox from '3box'

const Navbar = ({ location, setParentMobileOpen, ...props }) => {
  const { account } = useAccount()
  const { connector } = useWeb3React()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
  const [userImage, setUserImage] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const openModal = () => setShowModal(true)

  const closeModal = () => {
    if (account) {
      setUserAccount(account)
    }
    setShowModal(false)
  }

  useEffect(() => {
    async function getProfile() {
      if (ThreeBox) {
        const threeBoxProfile = await ThreeBox.getProfile(userAccount)
        let image
        if (threeBoxProfile.image && threeBoxProfile.image.length > 0) {
          image = `https://ipfs.infura.io/ipfs/${threeBoxProfile.image[0].contentUrl['/']}`
        } else {
          image = `${window.__GATSBY_IPFS_PATH_PREFIX__ ||
            ''}/profile-default.png`
        }
        setUserImage(image)
      }
    }
    getProfile()
  }, [userAccount])

  const handleSignOut = () => {
    if (connector) {
      connector.deactivate()
      if (typeof window !== undefined) {
        // clean up local storage
        window.localStorage.removeItem(
          '__WalletLink__:https://www.walletlink.org:Addresses',
        )
        window.localStorage.removeItem(
          '__WalletLink__:https://www.walletlink.org:SessionId',
        )
        window.localStorage.removeItem(
          '-walletlink:https://www.walletlink.org:session:id',
        )
        window.localStorage.removeItem(
          '-walletlink:https://www.walletlink.org:session:secret',
        )
        window.localStorage.removeItem(
          '-walletlink:https://www.walletlink.org:session:linked',
        )
        window.localStorage.removeItem('WALLET_CONNECTOR')
      }
      window.location.reload()
    }
  }

  useEffect(() => {
    let walletConnector
    if (typeof window !== undefined) {
      const storage = window.localStorage.getItem('WALLET_CONNECTOR')
      if (storage) {
        walletConnector = JSON.parse(storage)
        if (walletConnector && walletConnector.accounts) {
          setUserAccount(walletConnector.accounts[0])
        }
      }
    }

    if (walletConnector && walletConnector.name === 'injected') {
      metamaskAccountChange(accounts => {
        if (accounts && accounts.length > 0) {
          setUserAccount(accounts[0])
          if (typeof window !== undefined && accounts[0]) {
            const newWalletConnector = JSON.stringify({
              ...walletConnector,
              accounts: accounts,
            })
            window.localStorage.setItem('WALLET_CONNECTOR', newWalletConnector)
          }
        } else {
          window.localStorage.removeItem('WALLET_CONNECTOR')
          setUserAccount(null)
        }
      })
    }
  }, [])

  const isNewProjectPage =
    location &&
    (location.pathname.includes('new') || location.pathname.includes('edit'))

  const renderActions = () => {
    if (userAccount) {
      return (
        <Fragment>
          <Grid
            sx={{
              gridTemplateColumns: 'max-content max-content',
              alignItems: 'center',
            }}
            gap={5}
          >
            <Link
              to={`/profile/?id=${userAccount}`}
              sx={{
                lineHeight: 'inherit',
                '&:hover': { svg: { marginLeft: 0 } },
                textAlign: 'right',
              }}
            >
              <img
                src={
                  userImage
                    ? userImage
                    : `${window.__GATSBY_IPFS_PATH_PREFIX__ ||
                        ''}/profile-default.png`
                }
                alt="profile"
                sx={imgStyles}
              />
            </Link>
            <Menu
              items={[
                {
                  text: (
                    <Box
                      onClick={e => {
                        e.preventDefault()
                        openModal()
                      }}
                    >
                      Change wallet
                    </Box>
                  ),
                  icon: 'transfer.png',
                },
                {
                  text: (
                    <Box
                      onClick={e => {
                        e.preventDefault()
                        handleSignOut()
                      }}
                    >
                      Sign Out
                    </Box>
                  ),
                  icon: 'delegate.png',
                },
              ]}
            >
              <Box
                sx={{
                  justifySelf: 'end',
                  height: '9px',
                  width: '9px',
                  borderTop: '2px solid',
                  borderRight: '2px solid',
                  borderColor: 'secondary',
                  transform: 'rotate(135deg)',
                  cursor: 'pointer',
                  display: ['none', 'block', 'block'],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'linkHover',
                  },
                }}
              />
            </Menu>
          </Grid>
        </Fragment>
      )
    } else {
      return (
        <Button
          variant="primary"
          sx={{
            maxWidth: '140px',
            px: [3, 6, 6],
            height: ['40px', '48px', '48px'],
            fontSize: ['0.85rem', '1rem', '1rem'],
          }}
          text="Sign in"
          onClick={() => openModal()}
        />
      )
    }
  }

  return (
    <Grid {...props} sx={{ height: '96px', alignItems: 'center' }}>
      {!isMobileOpen ? (
        <Grid
          sx={{
            gridTemplateColumns: '1fr 1fr max-content max-content',
            justifyContent: 'space-between',
            alignItems: 'center',
            display: ['grid', 'none', 'none'],
          }}
          gap={0}
        >
          <Bars
            onClick={() => {
              setIsMobileOpen(true)
              setParentMobileOpen(true)
            }}
          />
          <Link
            to="/"
            sx={{ ml: [0, 4, 4], '&:hover': { svg: { marginLeft: 0 } } }}
          >
            <Logo sx={{ verticalAlign: 'middle', lineHeight: '1rem' }} />
          </Link>
          <Search
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            value={searchText}
            setValue={setSearchText}
            isMobile
          />
        </Grid>
      ) : (
        <Box sx={{ height: '100vh', width: '100vw' }}>
          <Close
            sx={{
              fill: 'secondary',
              position: 'absolute',
              zIndex: 12,
              top: 6,
              width: '15px',
            }}
            onClick={() => {
              setIsMobileOpen(false)
              setParentMobileOpen(false)
            }}
          />
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              backgroundColor: 'white',
              height: '100%',
              overflow: 'hidden',
              zIndex: 10,
              px: 6,
              pt: 8,
              '& a': {
                py: 3,
              },
            }}
          >
            <Styled.a href="/">Home</Styled.a>
            <Styled.a href="/categories/">Categories</Styled.a>
            <Styled.a href="/projects/">Projects</Styled.a>
            <Styled.a href="/charter/">Charter</Styled.a>
          </Box>
        </Box>
      )}
      <Grid
        sx={{
          gridTemplateColumns: [
            '1fr 1fr max-content',
            '114px repeat(3, max-content)',
          ],
          width: '100%',
          alignItems: 'center',
          display: ['none', 'grid', 'grid'],
        }}
        gap={7}
      >
        <Link
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            '&:hover': { svg: { marginLeft: 0 } },
          }}
        >
          <Logo sx={{ verticalAlign: 'middle', lineHeight: '1rem' }} />
          <span sx={{ pl: 3 }}>Everest</span>
        </Link>
        <Link to="/categories/">Categories</Link>
        <Link to="/projects/">Projects</Link>
        <Link to="/charter/">Charter</Link>
      </Grid>
      <Grid
        sx={{
          position: 'absolute',
          right: '20px',
          alignItems: 'center',
          gridTemplateColumns: '1fr max-content max-content',
          height: '100%',
          display: ['none', 'grid', 'grid'],
        }}
        gap={3}
      >
        <Search
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          value={searchText}
          setValue={setSearchText}
        />
        <Link
          to={userAccount ? '/projects/new/' : undefined}
          onClick={() => !userAccount && openModal()}
          sx={{
            backgroundColor: isNewProjectPage ? 'secondary' : 'transparent',
            padding: '12px 22px',
            mr: 1,
            mt: 1,
            transition: 'all 0.3s ease',
            '&:hover': {
              svg: {
                transition: 'all 0.3s ease',
                fill: isNewProjectPage ? 'white' : 'linkHover',
                marginLeft: 'inherit',
              },
            },
          }}
        >
          <Plus
            sx={{
              transform: 'rotate(45deg)',
              fill: isNewProjectPage ? 'white' : 'secondary',
            }}
          />
        </Link>
        {renderActions()}
      </Grid>
      {showModal && (
        <Modal showModal={showModal} closeModal={closeModal}></Modal>
      )}
    </Grid>
  )
}

const imgStyles = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid',
  borderColor: 'secondary',
  verticalAlign: 'middle',
}

Navbar.propTypes = {
  location: PropTypes.any,
  setParentMobileOpen: PropTypes.func,
}

export default Navbar
