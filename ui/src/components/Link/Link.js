/** @jsx jsx */
import PropTypes from 'prop-types'
import { Link as GatsbyLink } from 'gatsby'
import { jsx } from 'theme-ui'

const Link = ({ to, children, ...props }) => {
  return (
    <GatsbyLink
      to={to}
      sx={{
        textDecoration: 'none',
        display: 'block',
        color: 'secondary',
        fontSize: '1rem',
        fontWeight: 'bold',
        letterSpacing: '0.31px',
        lineHeight: '2.375rem',
        '&:focus': {
          outline: 'none !important',
        },
        '&:hover': {
          color: 'primary',
        },
      }}
      {...props}
      activeStyle={{ color: '#1E252C' }}
    >
      {children}
    </GatsbyLink>
  )
}

Link.propTypes = {
  to: PropTypes.string,
  children: PropTypes.any,
}

export default Link
