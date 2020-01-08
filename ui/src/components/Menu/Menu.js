/** @jsx jsx */
import { Styled, jsx } from 'theme-ui'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import { navigate } from 'gatsby'

import Placeholder from '../../images/profile-placeholder.svg'

import {
  Menu as MenuUI,
  MenuList,
  MenuButton,
  MenuItem,
} from '@reach/menu-button'
import '@reach/menu-button/styles.css'

import Link from '../../components/Link'
import { useEffect } from 'react'

const Menu = ({ accountId }) => {
  const { account, active, connector, library } = useWeb3React()

  const handleSignOut = () => {
    if (connector) {
      connector.deactivate()
      if (typeof window !== undefined) {
        window.localStorage.removeItem(
          '__WalletLink__:https://www.walletlink.org:Addresses',
        )
      }
    }
  }

  return (
    <MenuUI>
      <MenuButton
        sx={{
          border: 'none',
          width: '100%',
          cursor: 'pointer',
          color: 'white',
          background: 'inherit',
          padding: 0,
          '&:focus': { outline: 'none' },
        }}
      >
        <Placeholder
          sx={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'secondary',
          }}
        />
      </MenuButton>
      <MenuList
        sx={{
          width: '160px',
          height: '90px',
          boxShadow: '0 20px 64px 0 rgba(12,10,29,0.32)',
          bg: 'white',
          border: 'none',
          textAlign: 'center',
          '&>[data-reach-menu-item]:hover': {
            color: '#1E252C !important',
          },
          '&>[data-reach-menu-item][data-selected]': {
            background: 'none',
            color: 'secondary',
          },
        }}
      >
        <MenuItem
          sx={linkStyles}
          onSelect={() => navigate(`/profile/${accountId}`)}
        >
          Profile
        </MenuItem>
        <MenuItem sx={linkStyles} onSelect={handleSignOut}>
          Sign out
        </MenuItem>
      </MenuList>
    </MenuUI>
  )
}

const linkStyles = {
  textDecoration: 'none',
  display: 'block',
  color: '#4C66FF',
  fontSize: '1rem',
  fontWeight: 'bold',
  letterSpacing: '0.31px',
  lineHeight: '2.375rem',
}

export default Menu
