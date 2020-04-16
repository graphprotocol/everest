/** @jsx jsx */
import { useState, useEffect } from 'react'
import { jsx, Box, Styled } from 'theme-ui'
import PropTypes from 'prop-types'
import { Grid } from '@theme-ui/components'

const Footer = ({ location, ...props }) => {
  const [imagePrefix, setImagePrefix] = useState('')

  const isNewProjectPage =
    location &&
    (location.pathname.includes('new') || location.pathname.includes('edit'))

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  const rootStyles = {
    display: `${isNewProjectPage ? 'none' : 'grid'}`,
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

  return (
    <div sx={rootStyles} {...props}>
      <Box sx={{ textAlign: ['center', 'left', 'left'], fontSize: '0.875rem' }}>
        Made by{' '}
        <Styled.a
          href="https://thegraph.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontWeight: 'heading',
            display: 'inline',
            fontSize: '0.875rem',
          }}
        >
          The Graph
        </Styled.a>
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
          rel="noopener noreferrer"
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
          src={`${imagePrefix}/graph-gray.png`}
          alt="The Graph"
          title="The Graph"
          sx={iconStyles}
        />
        <img
          src={`${imagePrefix}/ethereum-gray.png`}
          alt="Ethereum"
          title="Ethereum"
          sx={iconStyles}
        />
        <img
          src={`${imagePrefix}/ipfs-gray.png`}
          alt="IPFS"
          title="IPFS"
          sx={iconStyles}
        />
      </Grid>
    </div>
  )
}

Footer.propTypes = {
  location: PropTypes.any,
}

export default Footer
