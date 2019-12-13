/** @jsx jsx */
import { useState, useLayoutEffect, Fragment } from 'react'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'

import Layout from '../components/Layout'
import Row from '../components/Row'
import Card from '../components/Card'
import Switcher from '../components/Switcher'

const Projects = ({ data }) => {
  const [selected, setSelected] = useState('cards')
  const [size, setSize] = useState([0, 0])

  const allProjects = data.everest.projects.map(project => {
    return {
      ...project,
      description: project.description.slice(0, 20) + '...'
    }
  })

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const challengedProjects = data.everest.projects.filter(
    p => p.isChallenged === true
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
      {selected === 'table' && size[0] > 830 ? (
        <Fragment>
          <Grid gap={1} columns={5}>
            {['Name', 'Category', 'Date Added', 'Reputation', 'Challenged'].map(
              entry => (
                <Styled.p sx={columnStyles}>{entry}</Styled.p>
              )
            )}
          </Grid>
          {allProjects.map(project => (
            <Row item={project} />
          ))}
        </Fragment>
      ) : (
        <Grid columns={[2, 3, 4, 6]} gap={[3, 2, 3, 2]}>
          {allProjects.map(project => (
            <Card
              title={project.name}
              description={project.description}
              isChallenged={project.isChallenged}
              variant={'project'}
              to={`/project/${project.id}`}
            />
          ))}
        </Grid>
      )}
    </Layout>
  )
}

const columnStyles = { textAlign: 'center', color: 'column' }

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
