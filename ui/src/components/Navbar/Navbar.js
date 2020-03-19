/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { navigate } from 'gatsby'
// import ThreeBox from '3box' // TODO: failing the build

import { metamaskAccountChange } from '../../services/ethers'
import { useAccount } from '../../utils/hooks'

import Link from '../../components/Link'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Menu from '../../components/Menu'
import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'

const Navbar = ({ location, ...props }) => {
  const { account } = useAccount()

  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState()
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
    setIsMobile(window.innerWidth < 640)
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

  return (
    <Grid {...props} sx={{ height: '96px' }}>
      {isMobile ? (
        <MobileNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <Grid
          sx={{
            gridTemplateColumns: ['auto', '30px 1fr'],
            width: [0, '100%', '100%'],
            alignItems: 'center',
          }}
          gap={2}
        >
          <Link to="/" sx={{ '&:hover': { svg: { marginLeft: 0 } } }}>
            <Logo sx={{ verticalAlign: 'middle', lineHeight: '1rem' }} />
          </Link>
          <Grid
            sx={{
              gridTemplateColumns: ['auto', 'repeat(4, max-content)'],
              width: [0, '100%', '100%'],
              maxWidth: '420px',
              alignItems: 'center',
            }}
            gap={6}
          >
            <Link to="/">
              <span>Everest</span>
            </Link>
            <Link to="/projects">Projects</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/charter">Charter</Link>
          </Grid>
        </Grid>
      )}
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
        {userAccount ? (
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
              {userImage ? (
                <img src={userImage} alt="profile" sx={imgStyles} />
              ) : (
                <img
                  src={`${window.__GATSBY_IPFS_PATH_PREFIX__ ||
                    ''}/profile-default.png`}
                  alt="profile"
                  sx={imgStyles}
                />
              )}
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
                  display: ['none', 'block'],
                  cursor: 'pointer',
                }}
              />
            </Menu>
          </Grid>
        ) : (
          <Button
            variant="primary"
            sx={{ maxWidth: '140px' }}
            text="Sign in"
            onClick={() => openModal()}
          />
        )}
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
}

export default Navbar
