/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { navigate } from 'gatsby'

import {
  Menu as MenuUI,
  MenuList,
  MenuButton,
  MenuItem,
} from '@reach/menu-button'
import '@reach/menu-button/styles.css'

const Menu = ({ children, items }) => {
  return (
    <MenuUI>
      <MenuButton sx={buttonStyles}>{children}</MenuButton>
      <MenuList sx={listStyles}>
        {items &&
          items.map(item => (
            <MenuItem
              sx={{ ...linkStyles, display: item.icon ? 'grid' : 'block' }}
              onSelect={item.handleSelect}
              key={item.text}
            >
              {item.icon && (
                <img
                  src={item.icon}
                  alt={`${item.text} icon`}
                  sx={iconStyles}
                />
              )}
              {item.text}
            </MenuItem>
          ))}
      </MenuList>
    </MenuUI>
  )
}

const buttonStyles = {
  border: 'none',
  width: '100%',
  cursor: 'pointer',
  color: 'white',
  background: 'inherit',
  padding: 0,
  '&:focus': { outline: 'none' },
}

const listStyles = {
  width: 'fit-content',
  height: '90px',
  boxShadow: '0 20px 64px 0 rgba(12,10,29,0.32)',
  bg: 'white',
  border: 'none',
  textAlign: 'center',
  padding: 5,
  '&>[data-reach-menu-item]:hover': {
    color: '#1E252C !important',
  },
  '&>[data-reach-menu-item][data-selected]': {
    background: 'none',
    color: 'secondary',
  },
}

const linkStyles = {
  textDecoration: 'none',
  display: 'block',
  color: '#4C66FF',
  fontSize: '1rem',
  fontWeight: 'bold',
  letterSpacing: '0.31px',
  lineHeight: '2.375rem',
  gridTemplateColumns: '24px 1fr',
  alignItems: 'center',
  justifyContent: 'left',
  gap: 3,
  textAlign: 'left',
}

const iconStyles = {
  width: '20px',
  height: '20px',
  verticalAlign: 'middle',
  marginRight: 4,
}

Menu.propTypes = {
  children: PropTypes.any,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
    }),
  ),
}

export default Menu
