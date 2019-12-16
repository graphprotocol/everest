/** @jsx jsx */
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const Divider = () => <Grid sx={styles} mt={[5, 6]} mb={[5, 6]} />

const styles = {
  height: '2px',
  width: '100%',
  border: '1px solid #cfcfcf'
}

export default Divider
