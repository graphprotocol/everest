/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Header, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Link from '../../components/Link'
import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'
import Plus from '../../images/close.svg'

const Navbar = ({ path, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState()

  useEffect(() => {
    setIsMobile(window.innerWidth < 640)
  }, [])

  const isNewProjectPage = path && path.includes('new')

  return (
    <Header {...props}>
      {isMobile ? (
        <MobileNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      ) : (
        <nav sx={navStyles}>
          <Styled.a href="/">
            <Logo sx={{ verticalAlign: 'middle' }} />
          </Styled.a>
          <Styled.a href="/">
            <span sx={{ color: 'primary' }}>Everest</span>
          </Styled.a>
          <Styled.a href="/projects">Projects</Styled.a>
          <Styled.a href="/categories">Categories</Styled.a>
        </nav>
      )}
      <Grid
        columns={2}
        sx={{ position: 'absolute', right: '0', top: 5, alignItems: 'center' }}
      >
        <Link
          to="/projects/new"
          sx={{
            backgroundColor: isNewProjectPage ? 'secondary' : 'white',
            padding: 4
          }}
        >
          <Plus
            sx={{
              transform: 'rotate(45deg)',
              fill: isNewProjectPage ? 'white' : 'secondary'
            }}
          />
        </Link>
        <Box sx={avatarStyles} />
      </Grid>
    </Header>
  )
}

const navStyles = {
  display: 'grid',
  gridTemplateColumns: ['auto', '50px 1fr 1fr 1fr'],
  width: [0, '100%', '100%'],
  maxWidth: '380px',
  height: '100px',
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
