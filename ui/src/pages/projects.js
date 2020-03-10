/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import { PROJECTS_QUERY } from '../utils/apollo/queries'

import Section from '../components/Section'
import Switcher from '../components/Switcher'
import Menu from '../components/Menu'
import Arrow from '../images/arrow.svg'

const Projects = () => {
  const [selected, setSelected] = useState('cards')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [isFilterOpen, setIsFileterOpen] = useState(false)

  const { loading, error, data } = useQuery(PROJECTS_QUERY, {
    variables:
      selectedFilter === 'All'
        ? {}
        : {
            where: {
              currentChallenge_not: null,
            },
          },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    console.error('Error with GraphQL query: ', error)
    return <div />
  }

  const allProjects = data && data.projects

  const challengedProjects = data.projects.filter(
    p => p.currentChallenge !== null,
  )

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
            <Menu
              items={[
                {
                  text: (
                    <Box sx={menuItemStyles}>
                      All projects <Arrow sx={{ fill: 'secondary' }} />
                    </Box>
                  ),
                  handleSelect: () => {
                    setSelectedFilter('All')
                  },
                },
                {
                  text: (
                    <Box sx={menuItemStyles}>
                      Challenged projects <Arrow sx={{ fill: 'secondary' }} />
                    </Box>
                  ),
                  handleSelect: () => {
                    setSelectedFilter('Challenged')
                  },
                },
              ]}
              menuStyles={{ left: 0, width: '280px', top: '60px' }}
              setOpen={setIsFileterOpen}
            >
              <Grid
                sx={{
                  gridTemplateColumns: 'max-content max-content',
                  width: 'fit-content',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 4,
                  backgroundColor: isFilterOpen ? 'secondary' : 'white',
                }}
              >
                <p
                  sx={{
                    variant: 'text.huge',
                    color: isFilterOpen ? 'white' : 'secondary',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedFilter}
                </p>
                <Box
                  sx={{
                    justifySelf: 'end',
                    height: '9px',
                    width: '9px',
                    borderTop: '2px solid',
                    borderRight: '2px solid',
                    borderColor: isFilterOpen ? 'white' : 'secondary',
                    transition: 'all 0.2s ease',
                    transform: isFilterOpen
                      ? 'rotate(-45deg)'
                      : 'rotate(135deg)',
                    display: ['none', 'block'],
                  }}
                />
              </Grid>
            </Menu>
          </Grid>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {allProjects.length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        {allProjects.length > 0 && (
          <Switcher selected={selected} setSelected={setSelected} />
        )}
      </Grid>
      <Section
        items={allProjects.map(project => {
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
        })}
        variant="project"
        selected={selected}
      />
    </Grid>
  )
}

const menuItemStyles = {
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'linkHover',
    transition: 'all 0.2s ease',
    svg: {
      transition: 'all 0.2s ease',
      fill: 'linkHover',
      ml: 2,
    },
  },
}

export default Projects
