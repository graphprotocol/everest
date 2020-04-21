/** @jsx jsx */
import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useLazyQuery } from '@apollo/react-hooks'

import Card from '../Card'
import SearchIcon from '../../images/search.svg'
import Close from '../../images/close.svg'

import { PROJECT_SEARCH } from '../../utils/apollo/queries'

const Search = ({ isSearchOpen, setIsSearchOpen, value, setValue }) => {
  let searchData = null

  const [searchProjects, { data }] = useLazyQuery(PROJECT_SEARCH)

  if (data && data.projectSearch) {
    searchData = data.projectSearch
  }

  useEffect(() => {
    const handleClick = () => {
      setIsSearchOpen(false)
      setValue('')
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const handleSearch = e => {
    const value = e.target ? e.target.value : ''
    if (value === '') {
      searchData = null
    }
    setValue(value)
    let param = ''
    if (value.length > 0) {
      let terms = value.trim().split(' ')
      terms.forEach((term, index) => {
        param += index === 0 ? `${term}:*` : `${term}`
        if (index !== terms.length - 1) {
          param += ' <-> '
        }
      })
      searchProjects({
        variables: {
          text: param,
        },
      })
    }
  }

  return isSearchOpen ? (
    <Box
      sx={{
        boxShadow:
          '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
        width: ['calc(100vw - 20px)', '480px', '620px'],
        position: ['absolute', 'relative', 'relative'],
        backgroundColor: 'white',
        mx: ['10px', 0, 0],
        right: 0,
      }}
    >
      <Grid
        sx={{
          gridTemplateColumns: '1fr max-content',
          position: 'relative',
          mr: '-6px',
          zIndex: 12,
        }}
        gap={0}
      >
        <input
          placeholder="Search projects"
          sx={{
            border: 'none',
            fontSize: '1rem',
            color: 'primary',
            fontFamily: 'body',
            px: 4,
            py: 3,
            '&::placeholder': {
              color: 'placeholder',
            },
            '&:focus': {
              outline: 'none',
            },
          }}
          autoFocus
          onChange={handleSearch}
          value={value}
          onClick={e => e.stopPropagation()}
        />
        {value && value.length > 0 && (
          <Close
            sx={{
              fill: 'secondary',
              position: 'absolute',
              right: '80px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
            onClick={e => {
              e.stopPropagation()
              setValue('')
            }}
          />
        )}
        <Box
          sx={{
            height: '60px',
            width: '60px',
            backgroundColor: 'secondary',
            textAlign: 'center',
          }}
        >
          <SearchIcon
            sx={{
              fill: 'white',
              height: '25px',
              width: '25px',
              marginTop: '50%',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            }}
          />
        </Box>
      </Grid>
      {value && value.length > 0 && searchData && searchData.length > 0 && (
        <Box
          sx={{
            height: '536px',
            maxHeight: '100vh',
            width: ['calc(100vw - 15px)', '485px', '626px'],
            borderTop: '1px solid',
            borderColor: 'grey',
            backgroundColor: 'white',
            position: 'absolute',
            zIndex: 10,
            overflowY: 'scroll',
            pt: 6,
            boxShadow:
              '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
          }}
        >
          {value !== '' && (
            <Grid
              sx={{
                gridTemplateColumns: ['1fr 1fr', '1fr 1fr', 'repeat(3, 1fr)'],
                margin: '0 auto',
                maxWidth: '570px',
              }}
              gap={4}
            >
              {searchData.map((project, index) => (
                <Card
                  key={index}
                  title={project.name}
                  variant="project"
                  image={project.avatar}
                  to={`/project/${project.id}`}
                  category={project.categories[0].name}
                  isChallenged={project.isChallenged}
                />
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  ) : (
    <SearchIcon
      sx={{
        fill: 'secondary',
        height: '25px',
        width: '25px',
        cursor: 'pointer',
        mr: [0, 3, 3],
        transition: 'all 0.3s ease',
        '&:hover': {
          fill: 'linkHover',
        },
      }}
      onClick={e => {
        e.stopPropagation()
        setIsSearchOpen(true)
      }}
    />
  )
}

Search.propTypes = {
  isSearchOpen: PropTypes.bool,
  setIsSearchOpen: PropTypes.func,
  value: PropTypes.string,
  setValue: PropTypes.func,
}

export default Search
