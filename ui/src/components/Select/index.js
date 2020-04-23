/** @jsx jsx */
import PropTypes from 'prop-types'
import { Fragment, useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Row from './Row'

const Select = ({ items, variant, setValue }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  return (
    <Box>
      <Fragment>
        {!selected && (
          <Grid
            sx={{
              gridTemplateColumns: 'max-content 1fr',
              alignItems: 'center',
              pt: 2,
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.32)',
              pb: 2,
            }}
            gap={1}
            onClick={() => {
              setIsOpen(!isOpen)
            }}
          >
            <Styled.p
              sx={{
                color: 'white',
                opacity: 0.64,
              }}
            >
              Pick a project
            </Styled.p>
            <Box
              sx={{
                justifySelf: 'end',
                height: '9px',
                width: '9px',
                borderTop: '2px solid',
                borderRight: '2px solid',
                borderColor: 'white',
                transform: isOpen ? 'rotate(-45deg)' : 'rotate(135deg)',
              }}
            />
          </Grid>
        )}
        {isOpen && (
          <Box
            sx={{
              maxWidth: '512px',
              position: 'absolute',
              background: 'white',
              width: '100%',
              height: 'fit-content',
              maxHeight: '300px',
              overflowY: 'scroll',
              zIndex: 5,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              {items &&
                items.map((item, index) => (
                  <Row
                    key={index}
                    item={item}
                    parent={item.parent}
                    selected={selected}
                    setSelected={item => {
                      setSelected(item)
                      setValue(item.id)
                      setIsOpen(false)
                    }}
                    variant={variant}
                  />
                ))}
            </Box>
          </Box>
        )}
        {selected && (
          <Row
            key={selected.name}
            item={selected}
            parent={selected.parent}
            selected={selected}
            setSelected={setSelected}
            sx={{ background: 'white', mx: 0, my: 3 }}
            close={true}
            variant={variant}
          />
        )}
      </Fragment>
    </Box>
  )
}

Select.propTypes = {
  variant: PropTypes.string,
  setValue: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
}

export default Select
