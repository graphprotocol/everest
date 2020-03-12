/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import charter from '../data/charter'

const Charter = () => {
  return (
    <Box>
      <Styled.h1 sx={{ textAlign: 'center', mb: 4 }}>Everest Charter</Styled.h1>
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
