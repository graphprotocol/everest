/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { navigate } from 'gatsby'

const Button = ({ to, text, variant, onClick, disabled, icon, ...props }) => {
  return (
    <button
      sx={{
        variant: `buttons.${variant}`,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'all',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => (onClick ? onClick(e) : navigate(to))}
      {...props}
    >
      {icon && <img sx={iconStyles} src={`../${icon}`} alt={'icon'} />}
      {text}
    </button>
  )
}

const iconStyles = {
  width: '24px',
  height: '24px',
  pr: 2,
}

Button.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string,
  variant: PropTypes.string,
  onClick: PropTypes.func,
}

export default Button
