/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useWeb3React } from '@web3-react/core'
import { navigate } from 'gatsby'

import { metamaskAccountChange } from '../../services/ethers'

import Link from '../../components/Link'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'
import Placeholder from '../../images/profile-placeholder.svg'

const Navbar = ({ path, ...props }) => {
  const { account } = useWeb3React()

  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState()
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState(account)
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
    setIsMobile(window.innerWidth < 640)
  }, [account])

  const isNewProjectPage = path && path.includes('new')

  return (
    <Grid {...props} sx={{ height: '96px' }}>
      {isMobile ? (
        <MobileNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <Grid sx={navStyles}>
          <Link to="/">
            <Logo sx={{ verticalAlign: 'middle' }} />
          </Link>
          <Link to="/">
            <span>Everest</span>
          </Link>
          <Link to="/projects">Projects</Link>
          <Link to="/categories">Categories</Link>
        </Grid>
      )}
      <Grid
        sx={{
          position: 'absolute',
          right: '20px',
          alignItems: 'center',
          gridTemplateColumns: '1fr 1fr',
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
          <Link
            to={`/profile/${userAccount}`}
            sx={{
              lineHeight: 'inherit',
              '&:hover': { svg: { marginLeft: 0 } },
            }}
          >
            <Placeholder
              sx={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid',
                borderColor: 'secondary',
                verticalAlign: 'middle',
              }}
            />
          </Link>
        ) : (
          <Modal showModal={showModal} closeModal={closeModal}>
            <Button
              variant="primary"
              sx={{ maxWidth: '140px' }}
              text="Sign in"
              onClick={() => openModal()}
            />
          </Modal>
        )}
      </Grid>
    </Grid>
  )
}

const navStyles = {
  gridTemplateColumns: ['auto', '50px 1fr 1fr 1fr'],
  width: [0, '100%', '100%'],
  maxWidth: '380px',
  alignItems: 'center',
}

Navbar.propTypes = {
  path: PropTypes.string,
}

export default Navbar
