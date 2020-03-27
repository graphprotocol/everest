/** @jsx jsx */
import { useState } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import queryString from 'query-string'
import { navigate } from '@reach/router'

import { PROJECTS_QUERY } from '../utils/apollo/queries'
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../utils/constants'

import Section from '../components/Section'
import Switcher from '../components/Switcher'
import Filters from '../components/Filters'
import Sorting from '../components/Sorting'

const Projects = ({ location }) => {
  const queryParams = queryString.parse(location.search)

  const [selected, setSelected] = useState('cards')
  const [selectedFilter, setSelectedFilter] = useState(
    queryParams && queryParams.view ? queryParams.view : FILTERS.all,
  )
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedOrderBy, setSelectedOrderBy] = useState(ORDER_BY['Name'])
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.ASC,
  )
  const [isSortingOpen, setIsSortingOpen] = useState(false)

  const variables = {
    orderDirection: selectedOrderDirection,
    orderBy: selectedOrderBy,
  }

  const { error, data } = useQuery(PROJECTS_QUERY, {
    variables:
      selectedFilter === FILTERS.all
        ? variables
        : {
            ...variables,
            where: {
              currentChallenge_not: null,
            },
          },
  })

  if (error) {
    console.error('Error with GraphQL query: ', error)
    return <div />
  }

  const allProjects = data ? data.projects : []

  const challengedProjects =
    allProjects && allProjects.filter(p => p.currentChallenge !== null)

  return (
    <Grid>
      <Grid columns={[1, 2, 2]} mb={6}>
        <Box>
          <Grid
            sx={{
              gridTemplateColumns: 'min-content 1fr ',
              alignItems: 'center',
            }}
            gap={4}
          >
            <Styled.h2
              sx={{
                borderRight: '1px solid',
                borderColor: 'grey',
                pr: 5,
                mb: 2,
              }}
            >
              Projects
            </Styled.h2>
            <Filters
              items={[
                {
                  text: 'All projects',
                  handleSelect: () => {
                    setSelectedFilter(FILTERS.all)
                    navigate(`?view=${FILTERS.all}`)
                  },
                },
                {
                  text: 'Challenged projects',
                  handleSelect: () => {
                    setSelectedFilter(FILTERS.challenged)
                    navigate(`?view=${FILTERS.challenged}`)
                  },
                },
              ]}
              menuStyles={{ left: 0, width: '280px', top: '60px' }}
              setIsFilterOpen={setIsFilterOpen}
              isFilterOpen={isFilterOpen}
              selectedFilter={selectedFilter}
            />
          </Grid>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {allProjects && allProjects.length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        <Grid
          sx={{
            gridTemplateColumns: '1fr max-content',
            alignItems: 'baseline',
          }}
        >
          <Sorting
            selectedOrderBy={selectedOrderBy}
            setSelectedOrderBy={setSelectedOrderBy}
            selectedOrderDirection={selectedOrderDirection}
            setSelectedOrderDirection={setSelectedOrderDirection}
            isSortingOpen={isSortingOpen}
            setIsSortingOpen={setIsSortingOpen}
          />
          <Switcher selected={selected} setSelected={setSelected} />
        </Grid>
      </Grid>
      <Section
        items={
          allProjects &&
          allProjects.map(project => {
            return {
              ...project,
              description: project.description
                ? project.description.length > 30
                  ? project.description.slice(0, 26) + '...'
                  : project.description
                : '',
              to: `/project/${project.id}`,
              image: project.avatar,
              isChallenged: project.currentChallenge !== null,
              category:
                project.categories.length > 0 ? project.categories[0].name : '',
            }
          })
        }
        variant="project"
        selected={selected}
      />
    </Grid>
  )
}

Projects.propTypes = {
  location: PropTypes.any,
}

export default Projects
