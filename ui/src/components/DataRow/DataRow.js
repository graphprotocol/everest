/** @jsx jsx */
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import PropTypes from 'prop-types'

const DataRow = ({ name, value, href }) => (
  <Grid
    sx={{
      gridTemplateColumns: [1, ' 72px 1fr'],
      alignItems: 'center'
    }}
    gap={[0, 2, 2]}
  >
    <p sx={{ variant: 'text.displaySmall' }}>{name}</p>
    <Styled.p sx={textStyles}>
      {href ? (
        <Styled.a href={href} target="_blank">
          {value}
        </Styled.a>
      ) : (
        value
      )}
    </Styled.p>
  </Grid>
)

const textStyles = { color: 'secondary', fontWeight: 'heading' }

DataRow.propTypes = {
  name: PropTypes.string,
  text: PropTypes.string
}

export default DataRow
