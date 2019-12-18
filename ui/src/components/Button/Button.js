/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { navigate } from 'gatsby'

const Button = ({ to, text, variant, onClick, disabled, ...props }) => {
  return (
    <button
      sx={{
        variant: `buttons.${variant}`,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'all'
      }}
      onClick={e => (onClick ? onClick(e) : navigate(to))}
      {...props}
    >
      {text}
    </button>
  )
}

Button.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string,
  variant: PropTypes.string,
  onClick: PropTypes.func
}

export default Button
