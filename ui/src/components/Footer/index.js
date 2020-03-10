/** @jsx jsx */
import { useState, useEffect } from 'react'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Footer = ({ ...props }) => {
  const [imagePrefix, setImagePrefix] = useState('')

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  return (
    <div sx={rootStyles} {...props}>
      <Box sx={{ textAlign: ['center', 'left', 'left'] }}>
        Made by{' '}
        <a
          href="https://thegraph.com"
          target="_blank"
          sx={{
            textDecoration: 'none',
            color: 'secondary',
            fontWeight: 'heading',
          }}
        >
          The Graph
        </a>
      </Box>
      <Grid
        sx={{
          textAlign: 'right',
          justifySelf: ['center', 'flex-end', 'flex-end'],
          gridTemplateColumns: '48px 1fr 1fr 1fr',
        }}
      >
        <a
          href="https://github.com/graphprotocol/everest"
          target="_blank"
          sx={{
            borderRight: '1px solid',
            borderColor: 'grey',
            pr: 3,
            justifySelf: 'start',
          }}
        >
          <img
            src={`${imagePrefix}/github.png`}
            alt="Github Everest"
            title="Github Everest"
            sx={iconStyles}
          />
        </a>
        <img
          src={`${imagePrefix}/graph.png`}
          alt="The Graph"
          title="The Graph"
          sx={iconStyles}
        />
        <img
          src={`${imagePrefix}/ethereum.png`}
          alt="Ethereum"
          title="Ethereum"
          sx={iconStyles}
        />
        <img
          src={`${imagePrefix}/ipfs.png`}
          alt="IPFS"
          title="IPFS"
          sx={iconStyles}
        />
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

const iconStyles = {
  width: '26px',
  height: 'auto',
}

export default Footer
