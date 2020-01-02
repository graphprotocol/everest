/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import '@reach/menu-button/styles.css'
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog'
import '@reach/dialog/styles.css'

import Close from '../../images/close.svg'

const Modal = ({ children, showModal, closeModal }) => {
  return (
    <div>
      {children}
      <Dialog
        isOpen={showModal}
        onDismiss={closeModal}
        sx={{ position: 'relative', maxWidth: '400px', width: '100%' }}
      >
        <Close
          onClick={closeModal}
          sx={{
            position: 'absolute',
            right: 4,
            top: 4,
            fill: '#bebebe',
            cursor: 'pointer',
          }}
        />
        <Styled.h4>Connect to a Wallet</Styled.h4>
        <Grid columns={2} gap={2} sx={gridStyles}>
          <Box>
            <img src="./metamask.png" sx={iconStyles} />
          </Box>
          <Box>
            <Styled.p>Connect to Metamask</Styled.p>
          </Box>
        </Grid>
        <Grid columns={2} gap={2} sx={gridStyles}>
          <Box>
            <img src="./coinbase-wallet.png" sx={iconStyles} />
          </Box>
          <Box>
            <Styled.p>Coinbase Wallet</Styled.p>
          </Box>
        </Grid>
        <Grid columns={2} gap={2} sx={gridStyles}>
          <Box>
            <img src="./wallet-connect.png" sx={iconStyles} />
          </Box>
          <Box>
            <Styled.p>Wallet Connect</Styled.p>
          </Box>
        </Grid>
      </Dialog>
    </div>
  )
}

const gridStyles = {
  gridTemplateColumns: 'min-content 1fr',
  alignItems: 'center',
  padding: '16px',
  border: '1px solid',
  borderColor: 'secondary',
  borderRadius: '16px',
  mt: 4,
  cursor: 'pointer',
}

const iconStyles = { width: '24px', height: 'auto', mr: 3 }

export default Modal
