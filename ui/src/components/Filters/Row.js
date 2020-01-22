/** @jsx jsx */
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Close from '../../images/close-small.svg'

const Row = ({
  item,
  parent,
  selected,
  setSelected,
  close,
  multiselect,
  ...props
}) => {
  return (
    <Grid
      key={item.name}
      columns={3}
      gap={4}
      sx={{
        gridTemplateColumns: 'min-content 1fr max-content',
        my: 4,
        mx: 5,
        cursor: close ? 'auto' : 'pointer',
        alignItems: 'center',
        border:
          multiselect && selected.find(sel => sel.name === item.name)
            ? '1px solid #4C66FF'
            : 'none',
      }}
      onClick={() => {
        if (close) return
        if (multiselect) {
          if (selected.includes(item.name)) {
            const index = selected.find(sel => sel.name === item.name)
            delete selected[index]
            setSelected(selected.flat())
          } else {
            setSelected(selected.concat(item))
          }
        } else {
          setSelected(item)
        }
      }}
      {...props}
    >
      <img
        src={item.image}
        alt={item.slug}
        sx={{ height: '48px', width: '64px', opacity: 0.8 }}
      />
      <Box>
        {parent && (
          <p sx={{ variant: 'text.displaySmaller' }}>{parent.name} ></p>
        )}
        <p sx={{ variant: 'text.emphasis' }}>{item.name}</p>
      </Box>
      {close && (
        <Close
          onClick={e => {
            e.preventDefault()
            if (multiselect) {
              const selectedItem = selected.find(sel => sel.name === item.name)
              const index = selected.indexOf(selectedItem)
              delete selected[index]
              setSelected(selected.flat())
            } else {
              setSelected(null)
            }
          }}
          sx={{
            pr: 3,
            fill: 'secondary',
            cursor: 'pointer',
          }}
        />
      )}
    </Grid>
  )
}

export default Row
