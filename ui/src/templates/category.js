/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Layout from '../components/Layout'
import Section from '../components/Section'
import Divider from '../components/Divider'
import Switcher from '../components/Switcher'

const Category = ({ pageContext, data }) => {
  const [selected, setSelected] = useState('cards')

  const categoryProjects = data.everest.projects.filter(project =>
    project.categories.includes(pageContext.name),
  )

  const challengedProjects = categoryProjects.filter(
    p => p.isChallenged === true,
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
          <Styled.p>
            That's why you always leave a note! Army had half a day. Bad news.
            Andy Griffith turned us down. He didn't like his nice trailer.
            That's why you always leave a note! Lala another one blurb
          </Styled.p>
        </Box>
      </Grid>
      <Divider />
      {pageContext.subcategories && (
        <Section
          title="Subcategories"
          description={`${pageContext.subcategories.length} Categories`}
          items={pageContext.subcategories.map(subcat => {
            return {
              name: subcat.name,
              description: `6 projects`,
              image: `/categories/${subcat.slug}.png`,
              to: `/category/${subcat.slug}`,
            }
          })}
          variant="category"
        />
      )}
      <Grid columns={[1, 2, 2]} mb={1} mt={6}>
        <Box>
          <Styled.h2>Projects</Styled.h2>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {categoryProjects.length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        {categoryProjects.length > 0 && (
          <Switcher selected={selected} setSelected={setSelected} />
        )}
      </Grid>

      <Section
        items={categoryProjects.map(categoryProject => {
          return {
            ...categoryProject,
            description: categoryProject.description.slice(0, 30) + '...',
            to: `/project/${categoryProject.id}`,
          }
        })}
        variant="project"
        selected={selected}
      />
    </Layout>
  )
}

const topStyles = {
  gridTemplateColumns: ['1fr', '286px 1fr'],
  position: 'relative',
}

const imageStyles = {
  width: '286px',
  height: '178px',
  objectFit: 'cover',
}

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
