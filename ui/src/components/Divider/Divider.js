/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Divider = ({ ...props }) => (
  <Grid sx={styles} mt={[5, 8]} mb={[5, 8]} {...props} />
)

const styles = {
  height: '2px',
  width: '100%',
  borderTop: '1px solid',
  borderColor: 'grey',
}

export default Divider
