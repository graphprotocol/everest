/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'

import Challenged from '../../images/challenged.svg'
import styles from './Card.styles'

const Card = ({ title, description, isChallenged, variant, imageBase }) => {
  console.log(
    'image base: ',
    `.${imageBase}/${title.toLowerCase().replace(/ /g, '-')}.png`
  )
  return (
    <Grid
      sx={styles.projectRoot}
      ml={['auto', 'auto', 0]}
      mr={['auto', 'auto', 0]}
    >
      <Grid
        pt={variant === 'project' ? 4 : 0}
        pb={4}
        sx={{ justifyContent: 'center' }}
      >
        {variant === 'project' ? (
          <Box sx={styles.box}></Box>
        ) : (
          <Box>
            <img
              src={`${imageBase}/${title.toLowerCase().replace(/ /g, '-')}.png`}
              alt={title}
              sx={{ height: '120px', width: '180px' }}
            />
          </Box>
        )}
        <Box p={3} sx={{ textAlign: 'center' }}>
          <Styled.p sx={styles.title}>{title}</Styled.p>
          <Styled.p sx={{ fontSize: '0.75rem', lineHeight: '0.875rem' }}>
            {description}
          </Styled.p>
          {isChallenged && <Challenged sx={{ paddingTop: 2 }} />}
        </Box>
      </Grid>
    </Grid>
  )
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.string,
  imageBase: PropTypes.string
}

export default Card
