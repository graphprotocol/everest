/** @jsx jsx */
import { jsx, Footer as GatsbyFooter } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Github from '../../images/github.svg'
import Discord from '../../images/discord-icon.svg'
import Medium from '../../images/medium-icon.svg'
import Twitter from '../../images/twitter-icon.svg'
import Badges from '../../images/badges.svg'
import Link from '../../components/Link'

const Footer = ({ ...props }) => {
  return (
    <GatsbyFooter sx={rootStyles} {...props}>
      <Link to="/about">About</Link>
      <Grid columns={4} gap={3} sx={{ maxWidth: '300px' }}>
        <a
          href="https://github.com/graphprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
        </a>
        <a
          href="https://discord.gg/vtvv7FP"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Discord />
        </a>
        <a
          href="https://medium.com/graphprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Medium />
        </a>
        <a
          href="https://twitter.com/graphprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter />
        </a>
      </Grid>
      <div sx={{ textAlign: 'right' }}>
        <Badges />
      </div>
    </GatsbyFooter>
  )
}

const rootStyles = {
  display: 'grid',
  gridColumnGap: '20px',
  justifyContent: 'space-between',
  gridTemplateColumns: '1fr 140px 1fr',
  alignItems: 'center',
  height: '96px',
}

export default Footer
