/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { navigate } from 'gatsby'

import { convertDate } from '../../utils/helpers'
import Challenged from '../../images/challenged.svg'

const Row = ({ item }) => {
  return (
    <Grid
      gap={3}
      sx={rootStyles}
      onClick={() => navigate(`/project/${item.id}`)}
    >
      <Grid columns={2} gap={4} sx={{ gridTemplateColumns: 'min-content 1fr' }}>
        <img
          src={`${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${item.image}`}
          sx={imageStyles}
          alt={item.name}
        />
        <Box>
          <Styled.h6 sx={{ color: 'secondary', fontWeight: 'heading' }}>
            {item.name}
          </Styled.h6>
          <Styled.p
            sx={{
              fontSize: '0.75rem',
              lineHeight: '0.875rem',
              color: 'blackFaded',
            }}
          >
            {item.description}
          </Styled.p>
        </Box>
      </Grid>
      <Box sx={boxStyles}>
        <Styled.p sx={{ color: 'blackFaded' }}>
          {item.categories
            .slice(0, 2)
            .reduce((acc, cur) => {
              acc.push(cur.name)
              return acc
            }, [])
            .join(',')}
          {item.categories.length > 1 && '...'}
        </Styled.p>
      </Box>
      <Box sx={boxStyles}>
        <Styled.p sx={{ color: 'blackFaded' }}>
          {convertDate(item.createdAt)}
        </Styled.p>
      </Box>
      <Box sx={boxStyles}>
        <Challenged sx={{ opacity: item.isChallenged ? 1 : 0, ml: 5 }} />
      </Box>
    </Grid>
  )
}

const rootStyles = {
  boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)',
  background: '#FFF',
  height: '96px',
  alignItems: 'center',
  my: 0,
  gridTemplateColumns: '400px 1fr 1fr 1fr',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'white',
    transition: 'all 0.3s ease',
    boxShadow:
      '0 0 32px 0 rgba(149,152,171,0.08), 0 0 32px 0 rgba(30,37,44,0.08)',
  },
  '@media (min-width: 830px) and (max-width: 1040px)': {
    gridTemplateColumns: '250px 1fr 1fr 1fr',
  },
}

const boxStyles = {
  textAlign: 'left',
}

const imageStyles = {
  display: 'block',
  borderRadius: '50%',
  width: '64px',
  ml: 4,
}

Row.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.any,
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    createdAt: PropTypes.number,
    image: PropTypes.string,
    reputation: PropTypes.string,
    isChallenged: PropTypes.bool,
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any,
      }),
    ),
  }),
}

export default Row
