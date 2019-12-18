/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Header } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import { getAddress, connectAccounts } from '../../services/ethers'

import Link from '../../components/Link'
import Button from '../../components/Button'
import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'
import Placeholder from '../../images/profile-placeholder.svg'

const Navbar = ({ path, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState()
  const [address, setAddress] = useState(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
    async function fetchAddress() {
      const ethAddress = await getAddress()
      setAddress(ethAddress)
    }
    fetchAddress()
  }, [])

  const isNewProjectPage = path && path.includes('new')

  return (
    <Header {...props} sx={{ height: '96px' }}>
      {isMobile ? (
        <MobileNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <Grid sx={navStyles}>
          <Styled.a href="/">
            <Logo sx={{ verticalAlign: 'middle' }} />
          </Styled.a>
          <Styled.a href="/">
            <span sx={{ color: 'primary' }}>Everest</span>
          </Styled.a>
          <Styled.a href="/projects">Projects</Styled.a>
          <Styled.a href="/categories">Categories</Styled.a>
        </Grid>
      )}
      <Grid
        sx={{
          position: 'absolute',
          right: '20px',
          top: 4,
          alignItems: 'center',
          gridTemplateColumns: 'max-content 1fr'
        }}
      >
        <Link
          to="/projects/new"
          sx={{
            backgroundColor: isNewProjectPage ? 'secondary' : 'white',
            padding: '22px'
          }}
        >
          <Plus
            sx={{
              transform: 'rotate(45deg)',
              fill: isNewProjectPage ? 'white' : 'secondary'
            }}
          />
        </Link>
        {address !== null ? (
          <Link to={`/profile/${address}`}>
            <Placeholder sx={avatarStyles} />
          </Link>
        ) : (
          <Button
            variant="primary"
            sx={{ maxWidth: '140px' }}
            text="Sign in"
            onClick={async () => {
              const accounts = await connectAccounts()
              setAddress(accounts[0])
            }}
          />
        )}
      </Grid>
    </Header>
  )
}

const navStyles = {
  gridTemplateColumns: ['auto', '50px 1fr 1fr 1fr'],
  width: [0, '100%', '100%'],
  maxWidth: '380px',
  alignItems: 'center'
}

const avatarStyles = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid',
  borderColor: 'secondary'
}

Navbar.propTypes = {}

export default Navbar
