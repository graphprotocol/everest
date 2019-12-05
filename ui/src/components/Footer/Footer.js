/** @jsx jsx */
import React from 'react'
import styled from 'styled-components'
import { Styled, jsx } from 'theme-ui'

import Github from '../../images/github.svg'
import Discord from '../../images/discord-icon.svg'
import Medium from '../../images/medium-icon.svg'
import Twitter from '../../images/twitter-icon.svg'
import Badges from '../../images/badges.svg'
import Link from '../../components/Link'

const Container = styled.div`
  display: grid;
  grid-column-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
  max-width: 300px;
`

const Root = styled.div`
  display: grid;
  grid-column-gap: 20px;
  justify-content: space-between;
  grid-template-columns: 1fr 140px 1fr;
  align-items: center;
`

const Footer = ({}) => {
  return (
    <Root>
      <Link to="/about">
        <Styled.a>About</Styled.a>
      </Link>
      <Container>
        <a href="https://github.com/graphprotocol" target="_blank">
          <Github />
        </a>
        <a href="https://discord.gg/vtvv7FP" target="_blank">
          <Discord />
        </a>
        <a href="https://medium.com/graphprotocol" target="_blank">
          <Medium />
        </a>
        <a href="https://twitter.com/graphprotocol" target="_blank">
          <Twitter />
        </a>
      </Container>
      <div sx={{ textAlign: 'right' }}>
        <Badges />
      </div>
    </Root>
  )
}

export default Footer
