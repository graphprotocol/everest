/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import TableIcon from '../../images/table-icon.svg'
import CardsIcon from '../../images/cards-icon.svg'

const Switcher = ({ selected, setSelected }) => {
  return (
    <Grid
      columns={2}
      sx={{
        maxWidth: '60px',
        justifySelf: 'flex-end',
        display: ['none', 'none', 'grid', 'grid']
      }}
    >
      <TableIcon
        sx={{
          ...iconStyles,
          fill: selected === 'table' ? 'secondary' : 'fill'
        }}
        onClick={() => setSelected('table')}
      />
      <CardsIcon
        sx={{
          ...iconStyles,
          fill: selected === 'cards' ? 'secondary' : 'fill'
        }}
        onClick={() => setSelected('cards')}
      />
    </Grid>
  )
}

const iconStyles = { cursor: 'pointer' }

Switcher.propTypes = {
  selected: PropTypes.string,
  setSelected: PropTypes.func
}

export default Switcher
