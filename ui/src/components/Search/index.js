/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import Card from '../Card'
import SearchIcon from '../../images/search.svg'
import Close from '../../images/close.svg'

import { PROJECTS_QUERY } from '../../utils/apollo/queries'

const Search = ({ isSearchOpen, setIsSearchOpen, value, setValue }) => {
  const [term, setTerm] = useState(value)

  console.log('term: ', term)

  const { loading, data } = useQuery(PROJECTS_QUERY, {
    variables: {
      where: {
        name_contains: term,
      },
    },
  })

  console.log('data: ', data)

  const testProjects = [
    {
      id: '123',
      name: 'One',
      avatar: 'QmYkDtGoesJxjVuG825CN9J7jGAeD8Sa5uvQKKjVq1Ubxz',
      categories: [{ name: 'Test' }],
      isChallenged: false,
    },
    {
      id: '123',
      name: 'Two',
      avatar: 'QmYkDtGoesJxjVuG825CN9J7jGAeD8Sa5uvQKKjVq1Ubxz',
      categories: [{ name: 'Test' }],
      isChallenged: false,
    },
    {
      id: '123',
      name: 'Three',
      avatar: 'QmYkDtGoesJxjVuG825CN9J7jGAeD8Sa5uvQKKjVq1Ubxz',
      categories: [{ name: 'Test' }],
      isChallenged: false,
    },
  ]

  useEffect(() => {
    const handleClick = () => {
      setIsSearchOpen(false)
    }
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
    }
  }, [])

  return isSearchOpen ? (
    <Box
      sx={{
        boxShadow:
          '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
        width: '620px',
        position: 'relative',
        backgroundColor: 'white',
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
          placeholder="Search projects & categories"
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
          onChange={e => {
            const value = e.target ? e.target.value : ''
            setTerm(value)
            setValue(value)
          }}
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
            }}
          />
        </Box>
      </Grid>
      {value && value.length > 0 && (
        <Box
          sx={{
            height: '480px',
            width: '626px',
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
          {term !== '' && testProjects && (
            <Grid
              sx={{
                gridTemplateColumns: '1fr 1fr 1fr',
                margin: '0 auto',
                maxWidth: '570px',
              }}
              gap={4}
            >
              {testProjects.map((project, index) => (
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
        mr: 3,
      }}
      onClick={e => {
        e.stopPropagation()
        setIsSearchOpen(true)
      }}
    />
  )
}

Search.propTypes = {}

export default Search
