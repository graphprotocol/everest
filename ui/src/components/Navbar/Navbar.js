/** @jsx jsx */
import React, { useState } from 'react'
import { Styled, jsx, Header } from 'theme-ui'

import MobileNavbar from './MobileNavbar'
import Logo from '../../images/logo.svg'

const isMobile = () => typeof window !== undefined && window.innerWidth < 640

const Navbar = ({}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Header>
      {isMobile() ? (
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
      <div sx={avatarStyles} />
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
  borderColor: 'secondary',
  position: 'absolute',
  right: '0',
  top: 4
}

Navbar.propTypes = {}

export default Navbar
