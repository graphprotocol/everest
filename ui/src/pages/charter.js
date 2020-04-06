/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import charter from '../data/charter'

const Charter = () => {
  return (
    <Box>
      <Box
        sx={{
          width: '100%',
          height: '400px',
          backgroundColor: 'rgba(30,37,44,0.04)',
          marginTop: [-6, -6, -9],
          position: 'relative',
        }}
      >
        <img
          src={`/mountain-empty.png`}
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
