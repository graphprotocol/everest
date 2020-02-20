/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Divider = ({ ...props }) => (
  <Grid
    sx={{
      height: '2px',
      width: '100%',
      borderTop: '1px solid',
      borderColor: 'grey',
      my: [5, 6],
    }}
    {...props}
  />
)

export default Divider
