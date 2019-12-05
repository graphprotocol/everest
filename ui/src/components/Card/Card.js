/** @jsx jsx */
import { jsx, Styled, Container, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import PropTypes from 'prop-types'

const Card = ({ title, subtitle, variant }) => {
  if (variant === 'category') {
    return (
      <Grid sx={categoryStyles}>
        <Grid p={2} sx={{ gridTemplateColumns: '64px 1fr' }}>
          <Box
            sx={{
              border: '1px solid #4C66FF',
              borderRadius: '50%',
              width: '64px'
            }}
          ></Box>
          <Box p={3}>
            <Styled.p sx={{ fontWeight: 'heading', color: 'secondary' }}>
              {title}
            </Styled.p>
            <Styled.p>{subtitle}</Styled.p>
          </Box>
        </Grid>
      </Grid>
    )
  } else {
    return (
      <Grid sx={projectStyles}>
        <Grid pt={4} pb={4} sx={{ justifyContent: 'center' }}>
          <Box
            sx={{
              border: '1px solid #4C66FF',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              margin: '0 auto'
            }}
          ></Box>
          <Box p={3} sx={{ maxWidth: '150px', textAlign: 'center' }}>
            <Styled.p sx={{ fontWeight: 'heading', color: 'secondary' }}>
              {title}
            </Styled.p>
            <Styled.p sx={{ fontSize: '0.75rem', lineHeight: '0.875rem' }}>
              {subtitle}
            </Styled.p>
          </Box>
        </Grid>
      </Grid>
    )
  }
}

const categoryStyles = {
  height: '80px',
  width: '304px',
  boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)'
}

const projectStyles = {
  height: '216px',
  width: '180px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)'
}

Card.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  variant: PropTypes.string
}

export default Card
