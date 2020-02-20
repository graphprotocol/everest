/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { navigate } from 'gatsby'

import Link from '../../components/Link'

const Footer = ({ ...props }) => {
  return (
    <div sx={rootStyles} {...props}>
      <Styled.p sx={{ textAlign: ['center', 'left', 'left'] }}>
        Made by{' '}
        <Link
          onClick={() => navigate('https://thegraph.com')}
          sx={{ display: 'inline-block' }}
        >
          The Graph
        </Link>
      </Styled.p>
      <Grid
        sx={{
          textAlign: 'right',
          maxWidth: '100px',
          justifySelf: ['center', 'flex-end', 'flex-end'],
        }}
        columns={3}
      >
        <img src={'/graph.svg'} alt="The Graph" title="The Graph" />
        <img src={'/ipfs.svg'} alt="IPFS" title="IPFS" />
        <img src={'/eth.svg'} alt="Ethereum" title="Ethereum" />
      </Grid>
    </div>
  )
}

const rootStyles = {
  display: 'grid',
  gridColumnGap: '20px',
  justifyContent: ['center', 'space-between', 'space-between'],
  gridTemplateColumns: ['1fr', '1fr 1fr', '1fr 1fr'],
  alignItems: 'center',
  height: '96px',
  my: [7, 0, 0],
}

export default Footer
