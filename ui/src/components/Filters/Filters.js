/** @jsx jsx */
import { Fragment, useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import categories from '../../data/categories.json'
import Button from '../Button'
import Row from './Row'
import Search from '../../images/search.svg'

const Filters = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const [searchText, setSearchText] = useState('')

  const allCategories = () => {
    let allCats = categories.reduce((acc, current) => {
      acc.push(current)
      if (current.subcategories) {
        const cat = current.subcategories.map(subcat => ({
          ...subcat,
          parent: current,
        }))
        acc.push(cat)
      }
      return acc.flat()
    }, [])

    if (searchText) {
      allCats = allCats.filter(
        allCat =>
          allCat.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1,
      )
    }
    return allCats
  }

  return (
    <Box>
      <Fragment>
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
            setSearchText('')
          }}
        >
          <Styled.p
            sx={{
              color: 'white',
            }}
          >
            {selected.length > 0 ? (
              <span>Pick more categories</span>
            ) : (
              <span>Pick categories</span>
            )}
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
        {isOpen && (
          <Box
            sx={{
              maxWidth: '512px',
              position: 'absolute',
              background: 'white',
              width: '100%',
              height: '512px',
              overflowY: 'scroll',
              zIndex: 5,
            }}
          >
            <Box>
              <Grid
                sx={{
                  gridTemplateColumns: '1fr max-content',
                  alignItems: 'center',
                  px: 5,
                  pt: 4,
                }}
              >
                <input
                  sx={{
                    color: 'rgba(9,6,16,0.64) !important',
                    borderBottom: '1px solid rgba(9,6,16,0.34)',
                    '&::placeholder': {
                      color: 'rgba(9,6,16,0.34) !important',
                      fontSize: '1.125rem !important',
                    },
                  }}
                  autofocus="autofocus"
                  placeholder="Search category"
                  onChange={e => {
                    setSearchText(
                      e.target.value ? e.target.value.toLowerCase() : '',
                    )
                  }}
                  value={searchText}
                />
                <Search />
              </Grid>
            </Box>
            <Button
              onClick={e => {
                e.preventDefault()
                setIsOpen(false)
                setSearchText('')
              }}
              text={`Select (${selected.length})`}
              variant="primary"
              sx={{
                mx: 5,
                my: 4,
                right: '10px',
                width: '172px',
              }}
            />
            <Box sx={{ position: 'relative' }}>
              {allCategories().map(category => (
                <Row
                  item={category}
                  parent={category.parent}
                  selected={selected}
                  setSelected={setSelected}
                />
              ))}
            </Box>
          </Box>
        )}
        {selected.map(item => (
          <Row
            item={item}
            parent={item.parent}
            selected={selected}
            setSelected={setSelected}
            sx={{ background: 'white', mx: 0, my: 3 }}
            close={true}
          />
        ))}
      </Fragment>
    </Box>
  )
}

export default Filters
