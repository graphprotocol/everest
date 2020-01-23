/** @jsx jsx */
import { useState, useEffect } from 'react'
import { jsx, Header } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { useWeb3React } from '@web3-react/core'
import { navigate } from 'gatsby'

import { getAddress, metamaskAccountChange } from '../../services/ethers'

import Link from '../../components/Link'
import Menu from '../../components/Menu'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'

const PROFILE_QUERY = gql`
  query everestProfile($id: ID!) {
    user(where: { id: $id }) {
      id
    }
  }
`

const Navbar = ({ path, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState()
  const [address, setAddress] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [userAccount, setUserAccount] = useState('')
  const openModal = () => setShowModal(true)

  const { account } = useWeb3React()

  const closeModal = () => {
    if (account) {
      setUserAccount(account)
    }
    setShowModal(false)
  }

  useEffect(() => {
    if (account) {
      setUserAccount(account)
    }
    metamaskAccountChange(accounts => setAddress(accounts[0]))
    setIsMobile(window.innerWidth < 640)
    async function fetchAddress() {
      const ethAddress = await getAddress()
      setAddress(ethAddress)
    }
    fetchAddress()
  }, [account])

  const isNewProjectPage = path && path.includes('new')
  const { data } = useQuery(PROFILE_QUERY, {
    variables: {
      id: address || '',
    },
  })

  console.log('ADDRESS: ', address)

  return (
    <Header {...props} sx={{ height: '96px' }}>
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
          gridTemplateColumns: 'max-content 1fr',
          height: '100%',
        }}
      >
        <Link
          to=""
          onClick={() => (address ? navigate('/projects/new') : openModal())}
          sx={{
            backgroundColor: isNewProjectPage ? 'secondary' : 'white',
            padding: '12px 22px',
            '&:hover': {
              color: 'linkHover',
              svg: {
                fill: 'inherit',
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
        {(data && data.user) || userAccount || address ? (
          <Menu accountId={userAccount ? userAccount : address} />
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
    </Header>
  )
}

const navStyles = {
  gridTemplateColumns: ['auto', '50px 1fr 1fr 1fr'],
  width: [0, '100%', '100%'],
  maxWidth: '380px',
  alignItems: 'center',
}

Navbar.propTypes = {}

export default Navbar
