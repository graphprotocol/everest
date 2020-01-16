/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'
import { navigate } from 'gatsby'

import Challenged from '../../images/challenged.svg'

const Card = ({ title, description, image, isChallenged, variant, to }) => {
  return (
    <Grid
      sx={{
        ...styles.root,
        '&:hover': {
          border: '2px solid',
          borderColor: 'hover',
          '.box': {
            alignSelf: 'center',
            justifySelf: 'center',
          },
          img: {
            height: variant === 'project' ? '80px' : '112px',
            width: variant === 'project' ? '80px' : ['152px', '164px', '164px'],
          },
        },
      }}
      ml={['auto', 'auto', 0]}
      mr={['auto', 'auto', 0]}
      onClick={() => navigate(to)}
    >
      <Grid
        pt={variant === 'project' ? 4 : 0}
        pb={4}
        sx={{ justifyContent: 'center' }}
      >
        {variant === 'project' ? (
          <Box sx={{ margin: 'auto' }}>
            <img
              src={
                image ||
                'https://storage.googleapis.com/graph-web/the-graph-livepeer.jpg'
              }
              alt={title}
              sx={{ height: '80px', width: '80px', borderRadius: '50%' }}
            />
          </Box>
        ) : (
          <Box className="box">
            <img
              src={image}
              alt={title}
              sx={{
                height: '120px',
                width: ['164px', '180px', '180px'],
              }}
            />
          </Box>
        )}
        <Box p={3} sx={{ textAlign: 'center' }}>
          <Styled.p sx={styles.title}>{title}</Styled.p>
          <Styled.p
            sx={{ fontSize: '0.75rem', lineHeight: '0.875rem', py: 0, px: 2 }}
          >
            {description}
          </Styled.p>
          {isChallenged && <Challenged sx={{ paddingTop: 2 }} />}
        </Box>
      </Grid>
    </Grid>
  )
}

const styles = {
  root: {
    height: '216px',
    width: ['164px', '180px', '180px'],
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)',
    marginTop: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    '&:hover': {
      border: '2px solid',
      borderColor: 'hover',
    },
  },
  box: {
    border: '1px solid #4C66FF',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    margin: '0 auto',
  },
  title: {
    fontWeight: 'heading',
    color: 'secondary',
  },
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  isChallenged: PropTypes.bool,
  variant: PropTypes.string,
  to: PropTypes.string,
}

export default Card
