/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import QRCode from 'qrcode.react'

const QRCodeData = ({ size, uri = '', ...props }) => {
  return (
    <Grid columns={1} p={3}>
      <QRCode
        size={size}
        value={uri}
        bgColor={'white'}
        style={{ margin: '0 auto' }}
      />
      <Styled.p>Scan QR code with a compatible wallet...</Styled.p>
    </Grid>
  )
}

QRCodeData.propTypes = {
  size: PropTypes.number,
  uri: PropTypes.string,
}

export default QRCodeData
