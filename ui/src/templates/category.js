/** @jsx jsx */
import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import { CATEGORY_QUERY } from '../utils/apollo/queries'
import { CATEGORIES_ORDER_BY, ORDER_DIRECTION } from '../utils/constants'
import { getBreadcrumbs } from '../utils/helpers'

import Section from '../components/Section'
import Divider from '../components/Divider'
import Switcher from '../components/Switcher'
import Link from '../components/Link'
import Seo from '../components/Seo'
import Loading from '../components/Loading'

const Category = ({ location, pageContext }) => {
  const pathParams = location.pathname.split('/')
  let categoryName
  if (pathParams.slice(-1)[0] === '') {
    categoryName = pathParams.slice(-2)[0]
  } else {
    categoryName = pathParams.slice(-1)[0]
  }

  const [selected, setSelected] = useState('cards')

  const { loading, error, data } = useQuery(CATEGORY_QUERY, {
    variables: {
      id: categoryName,
      orderBy: CATEGORIES_ORDER_BY.Name,
      orderDirection: ORDER_DIRECTION.ASC,
    },
  })

  const viewRef = useRef()

  if (loading)
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Loading variant="blue" />
      </Box>
    )
  if (error) {
    console.error(`Error getting the category: ${error.message}`)
    return
  }

  let category = data && data.category

  const categoryProjects = category ? category.projects : []

  const challengedProjects = categoryProjects.filter(
    p => p.currentChallenge !== null,
  )

  return (
    <Grid>
      <Seo
        title={pageContext ? pageContext.name : ''}
        description={pageContext ? pageContext.description : ''}
        image={pageContext ? pageContext.imageUrl : ''}
        pathname={`/category/${pageContext ? pageContext.id : ''}/`}
      />
      <Grid sx={topStyles} gap={[1, 4, 7]}>
        <Box sx={{ mx: ['auto', 0] }}>
          <img src={category.imageUrl} alt={category.id} sx={imageStyles} />
        </Box>
        <Box sx={{ mx: ['auto', 0], mt: [7, 0, 0] }}>
          <Grid
            sx={{
              gridTemplateColumns: `repeat(${
                getBreadcrumbs(category).length
              }, max-content)`,
              alignItems: 'center',
            }}
          >
            {getBreadcrumbs(category).length > 0 &&
              getBreadcrumbs(category)
                .reverse()
                .map((breadcrumb, index) => (
                  <Grid
                    sx={{
                      gridTemplateColumns: `repeat(2, max-content)`,
                      alignItems: 'center',
                    }}
                    key={index}
                  >
                    <Link to={breadcrumb.url}>
                      <p
                        sx={{
                          variant: 'text.large',
                          color: 'secondary',
                          fontWeight: 'heading',
                          '&:hover': {
                            color: 'linkHover',
                          },
                        }}
                      >
                        {breadcrumb.name}
                      </p>
                    </Link>
                    <Box
                      sx={{
                        height: '9px',
                        width: '9px',
                        borderTop: '2px solid',
                        borderRight: '2px solid',
                        borderColor: 'secondary',
                        transform: 'rotate(45deg)',
                        display: 'block',
                        cursor: 'pointer',
                        mt: '2px',
                      }}
                    />
                  </Grid>
                ))}
          </Grid>
          <Styled.h2>{category.name}</Styled.h2>
          <Styled.p sx={{ maxWidth: ['100%', '70%', '70%'] }}>
            {category.description}
          </Styled.p>
        </Box>
      </Grid>
      <Divider />
      {category.subcategories && category.subcategories.length > 0 && (
        <Section
          title=""
          description={`${category.subcategories.length} Subcategories`}
          items={category.subcategories.map(subcat => {
            return {
              name: subcat.name,
              description: `${subcat.projectCount} projects`,
              image: subcat.imageUrl,
              to: `/category/${subcat.id}/`,
            }
          })}
          variant="category"
        />
      )}
      <Grid columns={[1, 2, 2]} mb={1} mt={6} sx={{ alignItems: 'center' }}>
        <Box ref={viewRef}>
          {category.projectCount === 0 ? (
            <Styled.h3>No projects</Styled.h3>
          ) : (
            <Styled.h3>Projects</Styled.h3>
          )}
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {category.projectCount} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        {categoryProjects.length > 0 && (
          <Switcher
            selected={selected}
            setSelected={value => setSelected(value)}
          />
        )}
      </Grid>
      <Section
        items={categoryProjects.map(project => {
          return {
            ...project,
            description: project.description.slice(0, 40) + '...',
            to: `/project/${project.id}/`,
            categories: project.categories,
            isChallenged: project.currentChallenge !== null,
            image: project.avatar,
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
  location: PropTypes.any,
  pageContext: PropTypes.any,
}

export default Category
