/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'

import styles from './Card.styles'

const Card = ({ title, description, variant }) => {
  if (variant === 'category') {
    return (
      <Grid sx={styles.categoryRoot}>
        <Grid p={2} sx={{ gridTemplateColumns: '64px 1fr' }}>
          <Box sx={styles.box}></Box>
          <Box p={3}>
            <Styled.p sx={styles.title}>{title}</Styled.p>
            <Styled.p>{description}</Styled.p>
          </Box>
        </Grid>
      </Grid>
    )
  } else {
    return (
      <Grid sx={styles.projectRoot}>
        <Grid pt={4} pb={4} sx={{ justifyContent: 'center' }}>
          <Box
            sx={{
              ...styles.box,
              width: '80px',
              height: '80px',
              margin: '0 auto'
            }}
          ></Box>
          <Box p={3} sx={{ maxWidth: '150px', textAlign: 'center' }}>
            <Styled.p sx={styles.title}>{title}</Styled.p>
            <Styled.p sx={{ fontSize: '0.75rem', lineHeight: '0.875rem' }}>
              {description}
            </Styled.p>
          </Box>
        </Grid>
      </Grid>
    )
  }
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string
}

export default Card
