/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Fragment } from 'react'
import { createGlobalStyle } from 'styled-components'
import { reset } from 'styled-reset'
import { Main } from 'theme-ui'

import Footer from '../Footer'
import Navbar from '../Navbar'
import Seo from '../Seo'

const LayoutTemplate = ({ children }) => {
  const GlobalStyle = createGlobalStyle`
  ${reset}
  body {
    color: #1E252C;
    font-family: monospace;
  }
`
  const styles = {
    maxWidth: '1260px',
    margin: '0 auto',
    padding: '0 20px',
    boxSizing: 'content-box'
  }

  return (
    <Fragment>
      <GlobalStyle />
      <div sx={styles}>
        <Seo />
        <Navbar />
        <Main>{children}</Main>
        <Footer />
      </div>
    </Fragment>
  )
}

export default LayoutTemplate
