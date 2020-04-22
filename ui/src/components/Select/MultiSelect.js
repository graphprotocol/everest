/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Button from '../Button'
import Row from './Row'
import Divider from '../Divider'

const MultiSelect = ({
  title,
  subtitle,
  setValue,
  type,
  items,
  selectedItems,
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

  useEffect(() => {
    setSelected(
      selectedItems
        ? selectedItems.map(selectedItem => ({
            ...selectedItem,
            image: selectedItem.imageUrl,
          }))
        : [],
    )
  }, [selectedItems])

  const addSubcategories = (allCats, item) => {
    let newCategories = allCats
    if (allCats.lengts === items.length) {
      return newCategories
    }
    if (item.subcategories) {
      for (const subItem of item.subcategories.sort(compare)) {
        newCategories = newCategories.concat(subItem)
        newCategories = addSubcategories(newCategories, subItem)
      }
    }
    return newCategories
  }

  const allCategories = () => {
    let allCats = []
    for (const item of items) {
      allCats.push(item)
      allCats = addSubcategories(allCats, item)
    }
    if (searchText) {
      allCats = allCats.filter(
        allCat =>
          allCat.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1,
      )
    }
    return allCats
  }

  const compare = (a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  }

  const allItems = type === 'categories' ? allCategories() : items

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
            '&:hover': {
              borderBottom: '1px solid rgba(255,255,255,1)',
            },
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
              height: 'inherit',
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
              {allItems.map((item, index) => (
                <Row
                  key={`${item.name}${index}`}
                  item={{
                    ...item,
                    image: item.image || item.imageUrl,
                  }}
                  parent={item.parent}
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
                  disabled={items.every(it => it.disabled === true)}
                />
              </Box>
            )}
          </Box>
        )}
        {type === 'categories' &&
          selectedItems.map((item, index) => (
            <Row
              key={index}
              item={{
                ...item,
                image: item.image || item.imageUrl,
              }}
              parent={item.parent}
              selected={selectedItems}
              setSelected={setValue}
              sx={{ background: 'white', mx: 0, my: 3 }}
              close={true}
              multiselect={true}
            />
          ))}
      </Fragment>
    </Box>
  )
}

MultiSelect.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.any,
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
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
}

export default MultiSelect
