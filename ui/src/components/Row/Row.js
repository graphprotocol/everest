/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import Challenged from '../../images/challenged.svg'
import Placeholder from '../../images/project-placeholder.svg'
import PropTypes from 'prop-types'
import { convertDate } from '../../utils/helpers/date'

const Row = ({ item }) => {
  return (
    <Grid gap={1} columns={5} sx={rootStyles} p={3}>
      <Grid columns={2} gap={1} sx={{ gridTemplateColumns: 'min-content 1fr' }}>
        {item.image ? (
          <img src={item.image} sx={imageStyles} alt={item.name} />
        ) : (
          <Placeholder sx={imageStyles} />
        )}
        <Box>
          <Styled.h6 sx={{ color: 'secondary', fontWeight: 'heading' }}>
            {item.name}
          </Styled.h6>
          <Styled.p
            sx={{
              fontSize: '0.75rem',
              lineHeight: '0.875rem',
              color: 'tertiary'
            }}
          >
            {item.description.slice(0, 20) + '...'}
          </Styled.p>
        </Box>
      </Grid>
      <Box sx={boxStyles}>
        <Styled.p sx={{ color: 'secondary', fontWeight: 'heading' }}>
          {item.categories.map(cat => (
            <span>{cat}</span>
          ))}
        </Styled.p>
      </Box>
      <Box sx={boxStyles}>
        <Styled.p>{convertDate(item.createdAt)}</Styled.p>
      </Box>
      <Box sx={boxStyles}>
        <Styled.p>{item.reputation}</Styled.p>
      </Box>
      <Box sx={boxStyles}>
        <Challenged sx={{ opacity: item.isChallenged ? 1 : 0 }} />
      </Box>
    </Grid>
  )
}

const rootStyles = {
  boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)',
  background: '#FFF',
  height: '96px',
  alignItems: 'center',
  margin: '16px 0'
}

const boxStyles = {
  textAlign: 'center'
}

const imageStyles = {
  display: 'block',
  borderRadius: '50%',
  width: '64px'
}

Row.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    createdAt: PropTypes.string,
    reputation: PropTypes.string,
    isChallenged: PropTypes.bool
  })
}

export default Row
