/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Close from '../../images/close-small.svg'

const Row = ({
  item,
  selected,
  setSelected,
  close,
  multiselect,
  variant,
  ...props
}) => {
  const isSelected = multiselect && selected.find(sel => sel.name === item.name)
  return (
    <Grid
      key={item.name}
      columns={3}
      gap={4}
      sx={{
        gridTemplateColumns: 'min-content 1fr max-content',
        my: 4,
        mx: 5,
        height: '60px',
        cursor: close ? 'auto' : 'pointer',
        alignItems: 'center',
        border: isSelected ? '1px solid #4C66FF' : 'none',
        opacity: item.disabled ? 0.32 : 1,
        pointerEvents: item.disabled ? 'none' : 'all',
      }}
      onClick={() => {
        if (close) return
        if (multiselect) {
          const sel = selected.find(sel => sel.name === item.name)
          if (sel) {
            selected.find((sel, index) => {
              if (sel.name === item.name) {
                delete selected[index]
              }
              return null
            })
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
        src={
          variant === 'project'
            ? `${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${item.avatar}`
            : item.image
        }
        alt={item.slug}
        sx={
          variant === 'project'
            ? {
                height: '44px',
                width: '44px',
                opacity: 0.8,
                borderRadius: '50%',
                ml: isSelected ? '7px' : 2,
                objectFit: 'contain',
              }
            : {
                height: isSelected ? '58px' : '60px',
                width: '86px',
                opacity: 0.8,
                objectFit: 'contain',
              }
        }
      />
      <Box>
        {item.parentCategory && (
          <p sx={{ variant: 'text.smaller' }}>{item.parentCategory.name} ></p>
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
            mr: 3,
            fill: 'secondary',
            cursor: 'pointer',
          }}
        />
      )}
    </Grid>
  )
}

Row.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    image: PropTypes.string,
    avatar: PropTypes.string,
    slug: PropTypes.string,
    disabled: PropTypes.bool,
  }),
  selected: PropTypes.any,
  setSelected: PropTypes.func,
  close: PropTypes.bool,
  multiselect: PropTypes.bool,
  variant: PropTypes.string,
}

export default Row
