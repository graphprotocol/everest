/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import queryString from 'query-string'
import { navigate } from '@reach/router'
import { isMobile } from 'react-device-detect'

import { PROJECTS_QUERY, EVEREST_QUERY } from '../utils/apollo/queries'
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../utils/constants'

import Section from '../components/Section'
import Switcher from '../components/Switcher'
import Filters from '../components/Filters'
import Sorting from '../components/Sorting'
import Button from '../components/Button'
import Seo from '../components/Seo'
import Loading from '../components/Loading'

const Projects = ({ location }) => {
  const queryParams = queryString.parse(location.search)

  const [allProjects, setAllProjects] = useState([])
  const [projectCount, setProjectCount] = useState(0)
  const [challengesCount, setChallengesCount] = useState(null)
  const [claimedCount, setClaimedCount] = useState(null)
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
    first: 30,
    skip: 0,
  }

  const { data: everestData } = useQuery(EVEREST_QUERY)

  const { error, data, loading, fetchMore } = useQuery(PROJECTS_QUERY, {
    variables:
      selectedFilter === FILTERS.all
        ? variables
        : selectedFilter === FILTERS.challenged
        ? {
            ...variables,
            where: {
              currentChallenge_not: null,
            },
          }
        : {
            ...variables,
            where: {
              isRepresentative: true,
            },
          },
    notifyOnNetworkStatusChange: true,
  })

  if (error) {
    console.error('Error with GraphQL query: ', error)
    return <div />
  }

  useEffect(() => {
    setAllProjects(data ? data.projects : [])
    setProjectCount(
      everestData && everestData.everests
        ? everestData.everests[0].projectCount
        : 0,
    )
    setChallengesCount(
      everestData && everestData.everests
        ? everestData.everests[0].challengedProjects
        : 0,
    )
    setClaimedCount(
      everestData && everestData.everests
        ? everestData.everests[0].claimedProjects
        : 0,
    )
  }, [data, everestData])

  return (
    <Grid>
      <Seo
        description="Projects on the Everest registry."
        pathname="/projects/"
      />
      <Grid columns={[1, 2, 2]}>
        <Box>
          <Grid
            sx={{
              gridTemplateColumns: 'min-content 1fr ',
              alignItems: 'center',
            }}
            gap={[3, 4, 4]}
          >
            <Styled.h2
              sx={{
                borderRight: challengesCount !== 0 ? '1px solid' : 'none',
                borderColor: 'grey',
                pr: [3, 5, 5],
                mb: 2,
              }}
            >
              Projects
            </Styled.h2>
            <Filters
              items={[
                {
                  text: isMobile ? 'All' : 'All projects',
                  handleSelect: () => {
                    setSelectedFilter(FILTERS.all)
                    navigate(`/projects/?view=${FILTERS.all}`)
                  },
                },
                {
                  text: isMobile ? 'Challenged' : 'Challenged projects',
                  handleSelect: () => {
                    setSelectedFilter(FILTERS.challenged)
                    navigate(`/projects/?view=${FILTERS.challenged}`)
                  },
                },
                {
                  text: isMobile ? 'Claimed' : 'Claimed projects',
                  handleSelect: () => {
                    setSelectedFilter(FILTERS.claimed)
                    navigate(`/projects/?view=${FILTERS.claimed}`)
                  },
                },
              ]}
              menuStyles={{ left: 0, top: '60px' }}
              width={['initial', '280px', '280px']}
              setIsFilterOpen={setIsFilterOpen}
              isFilterOpen={isFilterOpen}
              selectedFilter={selectedFilter}
            />
          </Grid>
          <Grid columns={['max-content 1fr', '1fr', '1fr']}>
            <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
              {projectCount} Projects -{' '}
              {selectedFilter === FILTERS.claimed ? (
                <span>{claimedCount} Claimed</span>
              ) : (
                <span>{challengesCount} Challenges</span>
              )}
            </Styled.p>
            <Sorting
              selectedOrderBy={selectedOrderBy}
              setSelectedOrderBy={setSelectedOrderBy}
              selectedOrderDirection={selectedOrderDirection}
              setSelectedOrderDirection={setSelectedOrderDirection}
              isSortingOpen={isSortingOpen}
              setIsSortingOpen={setIsSortingOpen}
              orderBy={ORDER_BY}
              sx={{ display: ['grid', 'none', 'none'] }}
            />
          </Grid>
        </Box>
        <Grid
          sx={{
            gridTemplateColumns: '1fr max-content',
            alignItems: 'baseline',
            mr: [0, 5],
          }}
        >
          <Sorting
            selectedOrderBy={selectedOrderBy}
            setSelectedOrderBy={setSelectedOrderBy}
            selectedOrderDirection={selectedOrderDirection}
            setSelectedOrderDirection={setSelectedOrderDirection}
            isSortingOpen={isSortingOpen}
            setIsSortingOpen={setIsSortingOpen}
            orderBy={ORDER_BY}
            sx={{ display: ['none', 'grid', 'grid'] }}
          />
          <Switcher
            selected={selected}
            setSelected={setSelected}
            sx={{
              borderLeft: '1px solid',
              borderColor: 'grey',
              pl: 4,
            }}
          />
        </Grid>
      </Grid>
      <Box sx={{ position: 'relative' }}>
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
                to: `/project/${project.id}/`,
                image: project.avatar,
                isChallenged: project.currentChallenge !== null,
                category:
                  project.categories.length > 0
                    ? project.categories[0].name
                    : '',
              }
            })
          }
          variant="project"
          selected={selected}
        />
        {loading && <Loading variant="blue" />}
        {data &&
          data.projects &&
          !loading &&
          (selectedFilter === FILTERS.all
            ? data.projects.length < projectCount
            : selectedFilter === FILTERS.challenged
            ? data.projects.length < challengesCount
            : data.projects.length < claimedCount) && (
            <Button
              variant="secondary"
              text="Load more"
              sx={{
                margin: '0 auto',
                mt: 6,
                border: '1px solid',
                borderColor: 'secondary',
              }}
              onClick={() => {
                fetchMore({
                  variables:
                    selectedFilter === FILTERS.all
                      ? { ...variables, skip: data.projects.length }
                      : selectedFilter === FILTERS.challenged
                      ? {
                          ...variables,
                          skip: data.projects.length,
                          where: {
                            currentChallenge_not: null,
                          },
                        }
                      : {
                          ...variables,
                          skip: data.projects.length,
                          where: {
                            isRepresentative: true,
                          },
                        },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev
                    return Object.assign({}, prev, {
                      projects: [...prev.projects, ...fetchMoreResult.projects],
                    })
                  },
                })
              }}
            />
          )}
      </Box>
    </Grid>
  )
}

Projects.propTypes = {
  location: PropTypes.any,
}

export default Projects
