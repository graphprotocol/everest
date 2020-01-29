/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import QRCode from 'qrcode.react'

import Divider from '../Divider'
import Arrow from '../../images/arrow.svg'

const QRCodeData = ({ size, uri = '' }) => {
  return (
    <Grid columns={1} p={3}>
      <Styled.h2>Wallet Connect...</Styled.h2>
      <Styled.h6>
        Launch a compatible wallet app on your mobile or tablet and scan the QR
        icon.
      </Styled.h6>
      <a
        href="https://walletconnect.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Help with signing in <Arrow sx={{ ml: 1, fill: 'secondary' }} />
      </a>
      <Divider mt={0} mb={6} />
      <QRCode
        size={size}
        value={uri}
        bgColor={'white'}
        style={{ margin: '0 auto' }}
      />
    </Grid>
  )
}

QRCodeData.propTypes = {
  size: PropTypes.number,
  uri: PropTypes.string,
}

export default QRCodeData
