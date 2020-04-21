/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

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
      <Styled.a href={href} target="_blank">
        {value}
      </Styled.a>
    ) : (
      <Styled.p
        sx={{
          color: 'blackFaded',
          fontSize: ['0.85rem', '0.85rem ', '1rem'],
          lineHeight: '2.375rem',
        }}
      >
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
