/** @jsx jsx */
import { Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button'
import '@reach/menu-button/styles.css'

const Filters = () => {
  return (
    <Menu>
      {({ isOpen }) => {
        return (
          <Fragment>
            <MenuButton
              sx={{
                border: 'none',
                width: '100%',
                cursor: 'pointer',
                color: 'white',
                background: 'inherit',
                padding: 0,
                '&:focus': { outline: 'none' }
              }}
            >
              <Grid
                sx={{
                  gridTemplateColumns: 'max-content 1fr',
                  alignItems: 'center',
                  pt: 2
                }}
                gap={1}
              >
                <Styled.p
                  sx={{
                    color: 'white'
                  }}
                >
                  Pick categories
                </Styled.p>
                <Box
                  sx={{
                    justifySelf: 'end',
                    height: '9px',
                    width: '9px',
                    borderTop: '2px solid',
                    borderRight: '2px solid',
                    borderColor: 'white',
                    transform: isOpen ? 'rotate(-45deg)' : 'rotate(135deg)'
                  }}
                />
              </Grid>
            </MenuButton>
            <MenuList
              sx={{
                maxWidth: '1000px',
                width: '100%',
                maxHeight: '578px',
                height: '100%'
              }}
            >
              <MenuItem onSelect={() => console.log('SELECTED')}>TODO</MenuItem>
            </MenuList>
          </Fragment>
        )
      }}
    </Menu>
  )
}

export default Filters
