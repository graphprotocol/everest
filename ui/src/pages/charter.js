/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import charter from '../data/charter'

import Seo from '../components/Seo'

const Charter = () => {
  const [imagePrefix, setImagePrefix] = useState('')

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  return (
    <Box>
      <Seo description="Everest Charter to guide registry curation." />
      <Box
        sx={{
          width: '100%',
          height: '400px',
          backgroundColor: 'rgba(30,37,44,0.04)',
          marginTop: [-6, -6, -8],
          position: 'relative',
        }}
      >
        <img
          src={`${imagePrefix}/mountain-empty.png`}
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '325px',
            display: ['none', 'block', 'block'],
          }}
        />
        <Box
          sx={{
            margin: '0 auto',
            px: [3, 0, 0],
            maxWidth: '620px',
            width: '100%',
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <Styled.h1 sx={{ mb: 4 }}>Everest Charter</Styled.h1>
          <Styled.h6>
            Everest is a shared registry of projects that is curated by its
            members.
          </Styled.h6>
        </Box>
      </Box>
      {charter.map((entry, index) => (
        <Box
          key={index}
          sx={{
            margin: '0 auto',
            py: 6,
            maxWidth: '640px',
            width: '100%',
            '& a': {
              textDecoration: 'none',
              color: 'secondary',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                transition: 'all 0.3s ease',
                color: 'linkHover',
              },
            },
          }}
        >
          <Styled.h3 sx={{ my: 4 }}>{entry.heading}</Styled.h3>
          {entry.body}
        </Box>
      ))}
    </Box>
  )
}

export default Charter
