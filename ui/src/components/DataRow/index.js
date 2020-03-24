/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { navigate } from 'gatsby'

import Link from '../Link'

const DataRow = ({ name, value, href }) => (
  <Grid
    sx={{
      gridTemplateColumns: [1, ' 72px 1fr'],
      alignItems: 'center',
    }}
    gap={[0, 2, 2]}
  >
    <p sx={{ variant: 'text.small' }}>{name}</p>

    {href ? (
      <Link onClick={() => navigate(href)} target="_blank">
        {value}
      </Link>
    ) : (
        <Styled.p sx={{ fontWeight: 'heading', color: 'blackFaded', fontSize: ['0.85rem', '1rem ', '1rem'] }}>
          {value}
        </Styled.p>
      )}
  </Grid>
)

DataRow.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  href: PropTypes.string,
}

export default DataRow
