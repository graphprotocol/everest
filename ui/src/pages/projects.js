/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'

import Layout from '../components/Layout'
import Section from '../components/Section'
import Switcher from '../components/Switcher'

const Projects = ({ data }) => {
  const [selected, setSelected] = useState('cards')

  const allProjects = data.everest.projects.map(project => {
    return {
      ...project,
      description: project.description.slice(0, 20) + '...',
    }
  })

  const challengedProjects = data.everest.projects.filter(
    p => p.isChallenged === true,
  )

  return (
    <Layout>
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
    </Layout>
  )
}

export default Projects

export const query = graphql`
  query everestProjects {
    everest {
      projects {
        id
        name
        description
        categories
        createdAt
        reputation
        isChallenged
        owner {
          id
          name
        }
      }
    }
  }
`
