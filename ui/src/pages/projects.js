/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Section from '../components/Section'
import Switcher from '../components/Switcher'

const PROJECTS_QUERY = gql`
  query projects {
    projects {
      id
      name
      description
      avatar
    }
  }
`

const Projects = () => {
  const [selected, setSelected] = useState('cards')

  const { loading, error, data } = useQuery(PROJECTS_QUERY)

  if (loading) {
    return <div />
  }

  if (error) {
    console.error('Error with GraphQL query: ', error)
    return <div />
  }

  const allProjects =
    data &&
    data.projects.map(project => {
      return {
        ...project,
        description: project.description.slice(0, 20) + '...',
      }
    })

  const challengedProjects = data.projects.filter(p => p.isChallenged === true)

  return (
    <Grid>
      <Grid columns={[1, 2, 2]} mb={6}>
        <Box>
          <Styled.h2>Projects</Styled.h2>
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
            description: project.description.slice(0, 40) + '...',
            to: `/project/${project.id}`,
          }
        })}
        variant="project"
        selected={selected}
      />
    </Grid>
  )
}

export default Projects
