/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import PropTypes from 'prop-types'

const Stats = ({ stats }) => {
  return (
    <Grid gap={[2, 2, 6]} columns={3}>
      {stats.map(stat => (
        <Box sx={{ textAlign: 'center' }}>
          <Styled.p>{stat.title}</Styled.p>
          <Styled.h3>{stat.value}</Styled.h3>
        </Box>
      ))}
    </Grid>
  )
}

Stats.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.string
    })
  )
}

export default Stats
