/** @jsx jsx */
import React, { useState, createContext } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Global } from '@emotion/core'

import Footer from '../Footer'
import Navbar from '../Navbar'
import Seo from '../Seo'

export const ReactContext = createContext()

const LayoutTemplate = ({ children, ...props }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const styles = {
    maxWidth: '1260px',
    mx: 'auto',
    px: 4,
    boxSizing: 'content-box',
    position: 'relative',
  }

  const mStyles =
    (props.location &&
      props.location.pathname &&
      props.location.pathname.includes('new')) ||
    props.location.pathname.includes('edit')
      ? { backgroundColor: 'secondary', marginTop: '-18px' }
      : {}

  const childrenWithProps = React.Children.map(children, child => {
    return React.cloneElement(child, {
      foo: 'bar',
    })
  })

  return (
    <ReactContext.Provider>
      <Global
        styles={() => {
          return {
            '*, *::after, *::before': {
              boxSizing: 'border-box',
              margin: 0,
              padding: 0,
            },
            body: {
              fontFamily: 'Space Mono, monospace',
              transition: 'all 0.3s ease',
              WebkitFontSmoothing: 'antialiased',
              fontSmoothing: 'antialiased',
            },
          }
        }}
      />
      <Seo />
      <section
        sx={isMobileOpen ? { position: 'fixed', overflow: 'hidden' } : {}}
      >
        <Navbar
          sx={styles}
          location={props.location}
          setParentMobileOpen={setIsMobileOpen}
        />
        <Box
          sx={{
            ...mStyles,
            py: [5, 5, 8],
            '@keyframes fadein': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            animation: 'fadein 0.5s',
          }}
        >
          <main
            sx={{
              ...styles,
              mt: [5, 5, 0],
              minHeight: 'calc(100vh - 400px)',
              position: 'static',
            }}
          >
            {childrenWithProps}
          </main>
        </Box>
        <Footer location={props.location} sx={styles} />
      </section>
    </ReactContext.Provider>
  )
}

LayoutTemplate.propTypes = {
  children: PropTypes.any,
  location: PropTypes.any,
  props: PropTypes.any,
}

export default LayoutTemplate
