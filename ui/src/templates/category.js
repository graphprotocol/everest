/** @jsx jsx */
import { useState, useLayoutEffect, Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Layout from '../components/Layout'
import Section from '../components/Section'
import Row from '../components/Row'

import TableIcon from '../images/table-icon.svg'
import CardsIcon from '../images/cards-icon.svg'

const Category = ({ pageContext, data }) => {
  const [selected, setSelected] = useState('cards')
  const [size, setSize] = useState([0, 0])

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  console.log('PAGE CONTEXT. name: ', pageContext.name)
  console.log('projects: ', data.everest.projects)
  const categoryProjects = data.everest.projects.filter(project =>
    project.categories.includes(pageContext.name)
  )

  const challengedProjects = categoryProjects.filter(
    p => p.isChallenged === true
  )

  return (
    <Layout>
      <Grid sx={topStyles} gap={[1, 4, 7]}>
        <Box sx={boxStyles}>
          <img
            src={`/categories/${pageContext.slug}.png`}
            alt={pageContext.slug}
            sx={imageStyles}
          />
        </Box>
        <Box sx={boxStyles}>
          <Styled.h1>{pageContext.name}</Styled.h1>
          <Styled.p>{pageContext.description}</Styled.p>
        </Box>
      </Grid>
      {pageContext.subcategories && (
        <Section
          title="Subcategories"
          description={`${pageContext.subcategories.length} Categories`}
          items={pageContext.subcategories.map(subcat => {
            return {
              name: subcat.name,
              description: `6 projects`,
              image: `/categories/${subcat.slug}`,
              to: `/category/${subcat.slug}`
            }
          })}
          variant="category"
        />
      )}
      <Grid columns={[1, 2, 2]} mb={1}>
        <Box>
          <Styled.h2>Projects</Styled.h2>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {categoryProjects.length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        <Grid
          columns={2}
          sx={{
            maxWidth: '60px',
            justifySelf: 'flex-end',
            display: ['none', 'none', 'grid', 'grid']
          }}
        >
          <TableIcon
            sx={{
              ...iconStyles,
              fill: selected === 'table' ? 'secondary' : 'fill'
            }}
            onClick={() => setSelected('table')}
          />
          <CardsIcon
            sx={{
              ...iconStyles,
              fill: selected === 'cards' ? 'secondary' : 'fill'
            }}
            onClick={() => setSelected('cards')}
          />
        </Grid>
      </Grid>

      {selected === 'table' && size[0] > 830 ? (
        <Fragment>
          <Grid gap={1} columns={5} mt={5}>
            {['Name', 'Category', 'Date Added', 'Reputation', 'Challenged'].map(
              entry => (
                <Styled.p sx={columnStyles}>{entry}</Styled.p>
              )
            )}
          </Grid>
          {categoryProjects.map(project => (
            <Row item={project} />
          ))}
        </Fragment>
      ) : (
        <Section
          items={categoryProjects.map(categoryProject => {
            return {
              name: categoryProject.name,
              description: categoryProject.description.slice(0, 30) + '...',
              to: `/project/${categoryProject.id}`
            }
          })}
          variant="project"
        />
      )}
    </Layout>
  )
}

const iconStyles = { cursor: 'pointer' }

const topStyles = {
  gridTemplateColumns: ['1fr', '286px 1fr'],
  minHeight: '264px',
  position: 'relative',
  zIndex: 1,
  '&::before': {
    content: 'close-quote',
    position: 'absolute',
    zIndex: -1,
    height: '128px',
    width: '120%',
    marginLeft: '-10%',
    bottom: 0,
    background: 'url(/category-background.png) no-repeat',
    backgroundSize: 'cover'
  }
}

const imageStyles = {
  width: '286px',
  height: '178px',
  objectFit: 'cover'
}

const columnStyles = { textAlign: 'center', color: 'column' }

const boxStyles = { mx: ['auto', 0] }

export default Category

export const query = graphql`
  query {
    everest {
      projects {
        id
        name
        description
        categories
        createdAt
        reputation
        isChallenged
      }
    }
  }
`
