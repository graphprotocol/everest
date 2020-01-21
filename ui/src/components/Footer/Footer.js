/** @jsx jsx */
import { jsx, Footer as GatsbyFooter, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Link from '../../components/Link'

const Footer = ({ ...props }) => {
  return (
    <GatsbyFooter sx={rootStyles} {...props}>
      <Styled.p>
        Made by{' '}
        <Link to="https://thegraph.com" sx={{ display: 'inline-block' }}>
          The Graph
        </Link>
      </Styled.p>
      <Grid columns={4} gap={3} sx={{ maxWidth: '300px' }}></Grid>
      <Grid
        sx={{ textAlign: 'right', maxWidth: '100px', justifySelf: 'flex-end' }}
        columns={3}
      >
        <Link to="https://thegraph.com" title="The Graph">
          <img src={'./graph.svg'} alt="The Graph" />
        </Link>
        <Link to="https://ipfs.io/" title="IPFS">
          <img src={'./ipfs.svg'} alt="IPFS" />
        </Link>
        <Link to="https://ethereum.org/" title="Ethereum">
          <img src={'./eth.svg'} alt="Ethereum" />
        </Link>
      </Grid>
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
