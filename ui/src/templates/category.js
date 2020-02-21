/** @jsx jsx */
import { useState } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { graphql, navigate } from 'gatsby'
import queryString from 'query-string'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Section from '../components/Section'
import Divider from '../components/Divider'
import Switcher from '../components/Switcher'

const PROJECTS_QUERY = gql`
  query projects {
    projects {
      id
      name
      description
      avatar
      categories {
        id
      }
    }
  }
`

const Category = ({ pageContext, location }) => {
  // const category = location ? location.pathname.split('/').slice(-1)[0] : ''
  const [selected, setSelected] = useState(
    param && param.show && ['table', 'cards'].includes(param.show)
      ? param.show
      : 'cards',
  )
  const { loading, error, data } = useQuery(PROJECTS_QUERY)

  if (loading) {
    return <div />
  }

  if (error) {
    console.error('Error with GraphQL query: ', error)
    return <div />
  }

  let param
  if (location && location.search) {
    param = queryString.parse(location.search)
  }

  const setSelectedView = value => {
    setSelected(value)
    navigate('/category', { state: { show: 'table' } })
  }

  const categoryProjects = []

  const challengedProjects = categoryProjects.filter(
    p => p.isChallenged === true,
  )

  return (
    <Grid>
      <Grid sx={topStyles} gap={[1, 4, 7]}>
        <Box sx={{ mx: ['auto', 0] }}>
          <img
            src={`/categories/${pageContext.slug}.png`}
            alt={pageContext.slug}
            sx={imageStyles}
          />
        </Box>
        <Box sx={{ mx: ['auto', 0], mt: [7, 0, 0] }}>
          <Styled.h2>{pageContext.name}</Styled.h2>
          <Styled.p sx={{ maxWidth: ['100%', '70%', '70%'] }}>
            {pageContext.description}
          </Styled.p>
        </Box>
      </Grid>
      <Divider />
      {pageContext.subcategories && (
        <Section
          title=""
          description={`${pageContext.subcategories.length} Subcategories`}
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
      <Grid columns={[1, 2, 2]} mb={1} mt={6} sx={{ alignItems: 'center' }}>
        <Box>
          <Styled.h3>Projects</Styled.h3>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {categoryProjects.length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        {categoryProjects.length > 0 && (
          <Switcher
            selected={selected}
            setSelected={value => setSelectedView(value)}
          />
        )}
      </Grid>

      <Section
        items={categoryProjects.map(categoryProject => {
          return {
            ...categoryProject,
            description: categoryProject.description.slice(0, 40) + '...',
            to: `/project/${categoryProject.id}`,
          }
        })}
        variant="project"
        selected={selected}
      />
    </Grid>
  )
}

const topStyles = {
  gridTemplateColumns: ['1fr', '286px 1fr'],
  position: 'relative',
}

const imageStyles = {
  width: ['100%', '286px', '286px'],
  height: '178px',
  objectFit: 'cover',
  filter: 'drop-shadow(8px 24px 24px rgba(9,6,16,0.4))',
  boxShadow: '8px 24px 24px rgba(76,102,255,0.12)',
}

Category.propTypes = {
  pageContext: PropTypes.any,
  location: PropTypes.any,
}

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
