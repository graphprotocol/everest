/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Stats = ({ stats }) => {
  return (
    <Grid gap={[2, 2, 6]} columns={[1, 3, 3]}>
      {stats.map((stat, index) => (
        <Box sx={{ textAlign: 'center' }} key={index}>
          <Styled.p>{stat.title}</Styled.p>
          <Styled.h2
            sx={{
              color: 'secondary',
              '& span': {
                fontSize: '1.85rem',
                marginLeft: -3,
                position: 'relative',
                bottom: [0, '5px', '5px'],
              },
            }}
          >
            {stat.value}
          </Styled.h2>
        </Box>
      ))}
    </Grid>
  )
}

Stats.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.any,
    }),
  ),
}

export default Stats
