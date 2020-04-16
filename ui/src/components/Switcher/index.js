/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import TableIcon from '../../images/table-icon.svg'
import CardsIcon from '../../images/cards-icon.svg'

const Switcher = ({ selected, setSelected, ...props }) => {
  return (
    <Grid
      columns={2}
      sx={{
        maxWidth: '60px',
        justifySelf: 'flex-end',
        display: ['none', 'none', 'grid', 'grid'],
      }}
      {...props}
    >
      <TableIcon
        sx={{
          ...iconStyles,
          fill: selected === 'table' ? 'secondary' : 'fill',
          '&:hover': {
            opacity: selected === 'table' ? 1 : 0.64,
          },
        }}
        onClick={() => setSelected('table')}
      />
      <CardsIcon
        sx={{
          ...iconStyles,
          fill: selected === 'cards' ? 'secondary' : 'fill',
          '&:hover': {
            opacity: selected === 'cards' ? 1 : 0.64,
          },
        }}
        onClick={() => setSelected('cards')}
      />
    </Grid>
  )
}

const iconStyles = { cursor: 'pointer' }

Switcher.propTypes = {
  selected: PropTypes.string,
  setSelected: PropTypes.func,
}

export default Switcher
