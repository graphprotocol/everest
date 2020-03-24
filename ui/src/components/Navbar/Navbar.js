/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { navigate } from 'gatsby'
import { isMobile } from 'react-device-detect'

// import ThreeBox from '3box' // TODO: failing the build

import { metamaskAccountChange } from '../../services/ethers'
import { useAccount } from '../../utils/hooks'

import Link from '../../components/Link'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Menu from '../../components/Menu'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'
import Bars from '../../images/bars.svg'
import Arrow from '../../images/arrow.svg'
import Close from '../../images/close.svg'

const Navbar = ({ location, setParentMobileOpen, ...props }) => {
  const { account } = useAccount()

  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
  const [userImage, setUserImage] = useState('')
  const openModal = () => setShowModal(true)

  const closeModal = () => {
    if (account) {
      setUserAccount(account)
    }
    setShowModal(false)
  }

  // const handleSignOut = () => {
  //   if (connector) {
  //     connector.deactivate()
  //     if (typeof window !== undefined) {
  //       window.localStorage.removeItem(
  //         '__WalletLink__:https://www.walletlink.org:Addresses',
  //       )
  //     }
  //   }
  // }

  useEffect(() => {
    if (account) {
      setUserAccount(account)
    }
    metamaskAccountChange(accounts => setUserAccount(accounts[0]))
    if (typeof window !== undefined) {
      const storage = window.localStorage.getItem('WALLET_CONNECTOR')
      if (storage) {
        const walletConnector = JSON.parse(storage)
        if (walletConnector && walletConnector.accounts) {
          setUserAccount(walletConnector.accounts[0])
        }
      } else {
        setUserAccount(account)
      }
    }
  }, [account])

  // useEffect(() => {
  //   async function getProfile() {
  //     const threeBoxProfile = await ThreeBox.getProfile(userAccount)

  //     let image
  //     if (threeBoxProfile.image && threeBoxProfile.image.length > 0) {
  //       image = `https://ipfs.infura.io/ipfs/${threeBoxProfile.image[0].contentUrl['/']}`
  //     }
  //     setUserImage(image)
  //   }
  //   getProfile()
  // })

  const isNewProjectPage =
    location &&
    (location.pathname.includes('new') || location.pathname.includes('edit'))

  console.log('IS MOBILE: ', isMobile)

  const renderActions = () => {
    if (userAccount) {
      return (
        <Fragment>
          {isMobile ? (
            <Menu
              items={[
                {
                  text: (
                    <Box
                      onClick={e => {
                        e.preventDefault()
                        navigate(`/profile?id=${userAccount}`)
                      }}
                    >
                      Profile
                    </Box>
                  ),
                  icon: '/profile-default.png',
                },
                {
                  text: (
                    <Box
                      onClick={e =>
                        userAccount ? navigate('/projects/new') : openModal()
                      }
                    >
                      Add Project
                    </Box>
                  ),
                  icon: '/plus.png',
                },
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
                  icon: '/share.png',
                },
              ]}
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
            </Menu>
          ) : (
            <Grid
              sx={{
                gridTemplateColumns: 'max-content max-content',
                alignItems: 'center',
              }}
              gap={5}
            >
              <Link
                to={`/profile?id=${userAccount}`}
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
                    icon: '/share.png',
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
                    display: 'block',
                    cursor: 'pointer',
                  }}
                />
              </Menu>
            </Grid>
          )}
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
      {isMobile ? (
        !isMobileOpen ? (
          <Grid
            sx={{
              gridTemplateColumns: userAccount
                ? 'max-content max-content max-content'
                : '1fr 1fr max-content',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            gap={0}
          >
            <Bars
              onClick={() => {
                setIsMobileOpen(true)
                setParentMobileOpen(true)
              }}
            />
            <Link to="/" sx={{ '&:hover': { svg: { marginLeft: 0 } } }}>
              <Logo sx={{ verticalAlign: 'middle', lineHeight: '1rem' }} />
            </Link>
            {renderActions()}
          </Grid>
        ) : (
          <Box sx={{ height: '100vh', width: '100%' }}>
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
              <Styled.a href="/">
                Home <Arrow sx={{ ml: 1, fill: 'secondary' }} />
              </Styled.a>
              <Styled.a href="/projects">
                Projects <Arrow sx={{ ml: 1, fill: 'secondary' }} />
              </Styled.a>
              <Styled.a href="/categories">
                Categories <Arrow sx={{ ml: 1, fill: 'secondary' }} />
              </Styled.a>
              <Styled.a href="/categories">
                Charter <Arrow sx={{ ml: 1, fill: 'secondary' }} />
              </Styled.a>
            </Box>
          </Box>
        )
      ) : (
        <Grid
          sx={{
            gridTemplateColumns: [
              '1fr 1fr max-content',
              '30px repeat(4, max-content)',
            ],
            width: '100%',
            alignItems: 'center',
          }}
          gap={6}
        >
          <Link to="/" sx={{ '&:hover': { svg: { marginLeft: 0 } } }}>
            <Logo sx={{ verticalAlign: 'middle', lineHeight: '1rem' }} />
          </Link>

          <Link to="/">
            <span>Everest</span>
          </Link>
          <Link to="/projects">Projects</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/charter">Charter</Link>
        </Grid>
      )}

      {!isMobile && (
        <Grid
          sx={{
            position: 'absolute',
            right: '20px',
            alignItems: 'center',
            gridTemplateColumns: 'max-content 1fr',
            height: '100%',
          }}
          gap={3}
        >
          <Link
            onClick={() =>
              userAccount ? navigate('/projects/new') : openModal()
            }
            sx={{
              backgroundColor: isNewProjectPage ? 'secondary' : 'white',
              padding: '12px 22px',
              '&:hover': {
                svg: {
                  fill: isNewProjectPage ? 'white' : 'secondary',
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
      )}
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
}

export default Navbar
