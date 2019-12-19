/** @jsx jsx */
import { jsx, Box } from 'theme-ui'
import { Fragment } from 'react'
import { createGlobalStyle } from 'styled-components'
import { reset } from 'styled-reset'
import { Main } from 'theme-ui'

import Footer from '../Footer'
import Navbar from '../Navbar'
import Seo from '../Seo'

const LayoutTemplate = ({ children, ...props }) => {
  const GlobalStyle = createGlobalStyle`
  ${reset}
  body {
    color: #1E252C;
    font-family: 'Space Mono', monospace;
  }
`
  const styles = {
    maxWidth: '1260px',
    mx: 'auto',
    my: 0,
    padding: '0 20px',
    boxSizing: 'content-box',
    position: 'relative',
  }

  return (
    <Fragment>
      <GlobalStyle />
      <Box {...props}>
        <Seo />
        <Box sx={{ background: 'white' }}>
          <Navbar sx={styles} path={props && props.path} />
        </Box>
        <Main
          sx={{
            ...styles,
            mt: [5, 5, 0],
            minHeight: 'calc(100vh - 400px)',
            position: 'static',
          }}
        >
          {children}
        </Main>
        <Footer sx={styles} />
      </Box>
    </Fragment>
  )
}

export default LayoutTemplate
