/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { navigate } from 'gatsby'

const Button = ({
  to,
  text,
  variant,
  onClick,
  disabled,
  loading,
  icon,
  ...props
}) => {
  const [imagePrefix, setImagePrefix] = useState('')

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  return (
    <button
      sx={{
        variant: `buttons.${variant}`,
        opacity: disabled ? 0.64 : 1,
        pointerEvents: disabled || loading ? 'none' : 'all',
        cursor: 'pointer',
        bg:
          loading &&
          (variant === 'primary'
            ? 'rgba(76, 102, 255, 0.32) !important'
            : 'rgba(255, 255, 255, 0.32) !important'),
        color: loading && 'secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => (onClick ? onClick(e) : to ? navigate(to) : '')}
      {...props}
    >
      {icon && (
        <img sx={iconStyles} src={`${imagePrefix}/${icon}`} alt={'icon'} />
      )}
      {text}
      {loading && (
        <img
          src={`${imagePrefix}/dots.png`}
          sx={{ pt: 1, pl: 2, width: '24px' }}
          alt="dots icon"
        />
      )}
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
  disabled: PropTypes.bool,
  icon: PropTypes.string,
  loading: PropTypes.bool,
}

export default Button
