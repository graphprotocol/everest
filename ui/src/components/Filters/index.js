/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'

import Menu from '../Menu'
import Arrow from '../../images/arrow.svg'

const Filters = ({
  items,
  isFilterOpen,
  setIsFilterOpen,
  selectedFilter,
  width,
}) => {
  return (
    <Menu
      items={items.map(item => ({
        text: (
          <Box sx={menuItemStyles}>
            {item.text}{' '}
            <Arrow
              sx={{ fill: 'secondary', display: ['none', 'inline', 'inline'] }}
            />
          </Box>
        ),
        handleSelect: item.handleSelect,
      }))}
      menuStyles={{ left: 0, top: '60px', width: width }}
      setOpen={setIsFilterOpen}
    >
      <Grid
        sx={{
          gridTemplateColumns: 'max-content max-content',
          width: 'fit-content',
          alignItems: 'center',
          cursor: 'pointer',
          padding: [2, 4, 4],
          backgroundColor: isFilterOpen ? 'secondary' : 'white',
        }}
      >
        <p
          sx={{
            variant: 'text.huge',
            color: isFilterOpen ? 'white' : 'secondary',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: !isFilterOpen && 'linkHover',
            },
          }}
        >
          {selectedFilter}
        </p>
        <Box
          sx={{
            justifySelf: 'end',
            height: '9px',
            width: '9px',
            borderTop: '2px solid',
            borderRight: '2px solid',
            borderColor: isFilterOpen ? 'white' : 'secondary',
            transition: 'all 0.2s ease',
            transform: isFilterOpen ? 'rotate(-45deg)' : 'rotate(135deg)',
            display: 'block',
            '&:hover': {
              borderColor: !isFilterOpen && 'linkHover',
            },
          }}
        />
      </Grid>
    </Menu>
  )
}

const menuItemStyles = {
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'linkHover',
    transition: 'all 0.2s ease',
    svg: {
      transition: 'all 0.2s ease',
      fill: 'linkHover',
      ml: 2,
    },
  },
}

Filters.propTypes = {
  items: PropTypes.any,
  isFilterOpen: PropTypes.bool,
  setIsFilterOpen: PropTypes.func,
  selectedFilter: PropTypes.any,
  width: PropTypes.any,
}

export default Filters
