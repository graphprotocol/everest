/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'
import { navigate } from 'gatsby'

import Challenged from '../../images/challenged.svg'

const Card = ({
  title,
  description,
  image,
  category,
  isChallenged,
  variant,
  to,
}) => {
  return (
    <Grid
      sx={styles.root}
      ml={['auto', 'auto', 0]}
      mr={['auto', 'auto', 0]}
      onClick={() => navigate(to)}
    >
      <Grid
        p={variant === 'project' ? 4 : 0}
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
          {variant === 'project' && (
            <p sx={{ variant: 'text.tag' }}>{category}</p>
          )}
          <Styled.p sx={styles.title}>{title}</Styled.p>
          <Styled.p sx={{ fontSize: '0.75rem', lineHeight: '0.875rem', py: 1 }}>
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
    background: 'white',
    boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
    marginTop: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'white',
      transition: 'all 0.3s ease',
      boxShadow:
        '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
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
  category: PropTypes.string,
  isChallenged: PropTypes.bool,
  variant: PropTypes.string,
  to: PropTypes.string,
}

export default Card
