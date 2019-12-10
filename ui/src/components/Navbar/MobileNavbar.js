/** @jsx jsx */
import { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'

import Close from '../../images/close.svg'
import Bars from '../../images/bars.svg'

const MobileNavbar = ({ isOpen, setIsOpen }) => {
  return (
    <div onClick={() => setIsOpen(!isOpen)} sx={rootStyles}>
      {isOpen ? (
        <Fragment>
          <Close />
          <Box sx={boxStyles}>
            <Styled.a href="/">
              <span sx={{ color: 'primary' }}>Everest</span>
            </Styled.a>
            <Styled.a href="/projects">Projects</Styled.a>
            <Styled.a href="/categories">Categories</Styled.a>
          </Box>
        </Fragment>
      ) : (
        <Fragment>
          <Bars />
        </Fragment>
      )}
    </div>
  )
}

const rootStyles = {
  position: 'relative',
  top: 4,
  height: '32px'
}

const boxStyles = {
  position: 'fixed',
  width: '100%',
  backgroundColor: 'background'
}

MobileNavbar.propTypes = {
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func
}

export default MobileNavbar
