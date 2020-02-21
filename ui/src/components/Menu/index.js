/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Menu = ({ children, items }) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClick = () => {
      setIsOpen(false)
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <Grid sx={{ position: 'relative' }}>
      <Box
        onClick={e => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        {children}
      </Box>
      {isOpen && (
        <Box sx={listStyles}>
          {items &&
            items.map(item => (
              <Box
                sx={{ ...linkStyles, display: item.icon ? 'grid' : 'block' }}
                onClick={e => {
                  e.stopPropagation()
                  item.handleSelect && item.handleSelect(e)
                }}
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
              </Box>
            ))}
        </Box>
      )}
    </Grid>
  )
}

const listStyles = {
  width: 'fit-content',
  position: 'absolute',
  right: 0,
  top: '40px',
  boxShadow: '0 20px 64px 0 rgba(12,10,29,0.32)',
  bg: 'white',
  border: 'none',
  textAlign: 'center',
  cursor: 'pointer',
  padding: 5,
}

const linkStyles = {
  textDecoration: 'none',
  display: 'block',
  color: '#4C66FF',
  fontSize: '1rem',
  fontWeight: 'bold',
  letterSpacing: '0.31px',
  lineHeight: '2.375rem',
  gridTemplateColumns: '24px max-content',
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
      text: PropTypes.any,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
    }),
  ),
}

export default Menu
