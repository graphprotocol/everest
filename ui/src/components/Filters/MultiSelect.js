/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Button from '../Button'
import Row from './Row'
import Divider from '../Divider'

const Filters = ({
  title,
  subtitle,
  setValue,
  type,
  items,
  variant,
  children,
  setOpen,
  styles,
}) => {
  const [selected, setSelected] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleClick = () => {
      setIsOpen(false)
      setOpen && setOpen(false)
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [setOpen])

  let allItems = items

  if (type === 'categories') {
    let allCats = items.reduce((acc, current) => {
      acc.push({
        ...current,
        image: `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}cats/${
          current.id
        }.png`,
        name: current.name,
      })
      if (current.subcategories) {
        const cat = current.subcategories.map(subcat => ({
          ...subcat,
          parent: current,
          image: `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}cats/${
            subcat.id
          }.png`,
        }))
        acc.concat(cat)
      }
      return acc
    }, [])

    if (searchText) {
      allCats = allCats.filter(
        allCat =>
          allCat.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1,
      )
    }
    allItems = allCats
  }

  return (
    <Box>
      <Fragment>
        <Grid
          sx={{
            gridTemplateColumns: 'max-content 1fr',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.32)',
            pb: 2,
            ...styles,
          }}
          gap={1}
          onClick={e => {
            if (styles && styles.pointerEvents === 'none') {
              return
            }
            e.stopPropagation()
            setOpen && setOpen(!isOpen)
            setIsOpen(!isOpen)
            setSearchText('')
          }}
        >
          {children}
        </Grid>
        {isOpen && (
          <Box
            sx={{
              maxWidth: type === 'categories' ? '560px' : '468px',
              marginLeft: -5,
              position: 'absolute',
              background: 'white',
              width: '100%',
              height: '100%',
              maxHeight: '540px',
              overflowY: 'scroll',
              zIndex: 5,
              mt: type === 'categories' ? '-96px' : '-8px',
              boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
              padding: 5,
            }}
            onClick={e => e.stopPropagation()}
          >
            <Box>
              {type === 'categories' ? (
                <p
                  sx={{
                    variant: 'text.field',
                    color: 'blackFaded',
                    pt: 5,
                    pl: 5,
                  }}
                >
                  {title}
                </p>
              ) : (
                <Box sx={{ ml: 5, mt: 5 }}>
                  <p
                    sx={{ variant: 'text.large', fontWeight: 'heading', mb: 2 }}
                  >
                    {title}
                  </p>
                  <p>{subtitle}</p>
                </Box>
              )}
              {type === 'categories' && (
                <Grid
                  sx={{
                    gridTemplateColumns: '1fr max-content',
                    alignItems: 'center',
                    px: 5,
                    pt: 4,
                    position: 'relative',
                  }}
                >
                  <input
                    sx={{
                      color: 'rgba(9,6,16,0.64) !important',
                      borderBottom: '1px solid rgba(9,6,16,0.34)',
                      '&::placeholder': {
                        color: 'rgba(9,6,16,0.34) !important',
                        fontSize: '18px !important',
                      },
                    }}
                    autoFocus="autofocus"
                    placeholder="Search category"
                    onChange={e => {
                      setSearchText(
                        e.target.value ? e.target.value.toLowerCase() : '',
                      )
                    }}
                    value={searchText}
                  />
                  <Button
                    onClick={e => {
                      e.preventDefault()
                      setIsOpen(false)
                      setSearchText('')
                      setValue(selected)
                    }}
                    text={`Select (${selected.length})`}
                    variant="primary"
                    sx={{
                      m: 0,
                      px: 4,
                      right: '24px',
                      fontSize: '1rem',
                      position: 'absolute',
                      boxSizing: 'border-box',
                      opacity: selected && selected.length > 0 ? 1 : 0.64,
                    }}
                  />
                </Grid>
              )}
            </Box>
            <Box sx={{ position: 'relative' }}>
              {allItems.map((category, index) => (
                <Row
                  key={`${category.name}${index}`}
                  item={category}
                  parent={category.parent}
                  selected={selected}
                  setSelected={setSelected}
                  multiselect={true}
                  variant={variant}
                />
              ))}
            </Box>
            {type !== 'categories' && (
              <Box sx={{ mx: 5 }}>
                <Divider mt={5} mb={5} />
                <Button
                  onClick={e => {
                    e.preventDefault()
                    setIsOpen(false)
                    setOpen && setOpen(false)
                    setValue(selected)
                  }}
                  text={`Vote (${selected.length})`}
                  variant="primary"
                  sx={{
                    m: 0,
                    px: 4,
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    opacity: selected && selected.length > 0 ? 1 : 0.64,
                  }}
                />
              </Box>
            )}
          </Box>
        )}
        {type === 'categories' &&
          selected.map(item => (
            <Row
              key={item.name}
              item={item}
              parent={item.parent}
              selected={selected}
              setSelected={setSelected}
              sx={{ background: 'white', mx: 0, my: 3 }}
              close={true}
              multiselect={true}
            />
          ))}
      </Fragment>
    </Box>
  )
}

Filters.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.number,
  setValue: PropTypes.func,
  children: PropTypes.any,
  setOpen: PropTypes.func,
  styles: PropTypes.any,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
}

export default Filters
