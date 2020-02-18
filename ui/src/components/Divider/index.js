/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Divider = ({ ...props }) => <Grid sx={styles} my={[5, 6]} {...props} />

const styles = {
  height: '2px',
  width: '100%',
  borderTop: '1px solid',
  borderColor: 'grey',
}

export default Divider
