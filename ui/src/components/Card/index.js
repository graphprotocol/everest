/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'

import { pickCategories } from '../../utils/helpers'

import Link from '../Link'
import Loading from '../Loading'
import Challenged from '../../images/challenge.svg'

const Card = ({
  title,
  description,
  image,
  categories,
  isChallenged,
  variant,
  to,
  pending,
}) => {
  const category = pickCategories(categories)[0]
  return (
    <Link
      to={to}
      sx={pending ? { ...styles.root, pointerEvents: 'none' } : styles.root}
      ml={['auto', 'auto', 0]}
      mr={['auto', 'auto', 0]}
    >
      {pending && <Loading variant="blue" sx={{ top: 'calc(50% - 6px)' }} />}
      <Box sx={{ opacity: pending ? 0.32 : 1 }}>
        {variant === 'project' && isChallenged && (
          <Challenged
            sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              height: '24px',
              width: 'auto',
            }}
          />
        )}
        <Grid
          gap={0}
          pt={variant === 'project' ? 5 : 0}
          pb={4}
          sx={{
            justifyContent: 'center',
            pb: 4,
            pt: variant === 'project' ? 6 : 0,
            px: variant === 'project' ? 4 : 0,
          }}
        >
          {variant === 'project' || pending ? (
            <Box sx={{ textAlign: 'center', position: 'relative' }}>
              <img
                src={`${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${image}`}
                alt={title}
                sx={{
                  height: '80px',
                  width: '80px',
                  borderRadius: '50%',
                }}
              />
            </Box>
          ) : (
            <Box>
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
          <Box
            sx={{
              textAlign: 'center',
              py:
                variant !== 'project'
                  ? title && title.length > 15
                    ? 0
                    : 3
                  : 3,
              px:
                variant === 'project'
                  ? 0
                  : title && title.length === 16
                  ? 4
                  : [2, 3, 3],
              position: 'relative',
            }}
          >
            {variant === 'project' && (
              <p sx={{ variant: 'text.tag', fontSize: '10px' }}>
                {category ? category.name : ''}
              </p>
            )}
            <Styled.p
              sx={{
                fontWeight: 'heading',
                color: 'secondary',
              }}
            >
              {title && title.length > 22 ? title.slice(0, 22) + '...' : title}
            </Styled.p>
            {variant !== 'project' && (
              <p sx={{ variant: 'text.tag', pt: 1 }}>{description}</p>
            )}
          </Box>
        </Grid>
      </Box>
    </Link>
  )
}

const styles = {
  root: {
    position: 'relative',
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
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  categories: PropTypes.any,
  isChallenged: PropTypes.bool,
  variant: PropTypes.string,
  to: PropTypes.string,
  pending: PropTypes.bool,
}

export default Card
