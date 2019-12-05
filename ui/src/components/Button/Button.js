/** @jsx jsx */
import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import styled from 'styled-components'
import { Styled, jsx } from 'theme-ui'
import { navigate } from 'gatsby'

const Button = ({ to, text, variant }) => {
  return (
    <button
      sx={{
        variant: `buttons.${variant}`
      }}
      onClick={() => navigate(to)}
    >
      {text}
    </button>
  )
}

Button.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string
}

export default Button
