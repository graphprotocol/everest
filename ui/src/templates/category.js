/** @jsx jsx */
import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import Section from '../components/Section'
import Divider from '../components/Divider'
import Switcher from '../components/Switcher'

import { CATEGORY_QUERY } from '../utils/apollo/queries'

const Category = ({ location }) => {
  const pathParams = location.pathname.split('/')
  let categoryName
  if (pathParams.slice(-1)[0] === '') {
    categoryName = pathParams.slice(-2)[0]
  } else {
    categoryName = pathParams.slice(-1)[0]
  }

  const [imagePrefix, setImagePrefix] = useState('')

  const [selected, setSelected] = useState('cards')

  const { loading, error, data } = useQuery(CATEGORY_QUERY, {
    variables: {
      id: categoryName,
    },
  })

  const viewRef = useRef()

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__)
    }
  }, [])

  if (loading) return <div>Loading</div>
  if (error) {
    console.error(`Error getting the category: ${error.message}`)
    return
  }

  let category = data && data.category

  const categoryProjects = category ? category.projects : []

  const challengedProjects = categoryProjects.filter(
    p => p.currentChallenge !== null,
  )
  const allProjects = () => {
    let allCategoriesProjects = categoryProjects
    if (category && category.subcategories) {
      category.subcategories.forEach(subcat => {
        if (subcat.projects) {
          allCategoriesProjects = [...allCategoriesProjects, ...subcat.projects]
        }
      })
    }
    return allCategoriesProjects
  }

  return (
    <Grid>
      <Grid sx={topStyles} gap={[1, 4, 7]}>
        <Box sx={{ mx: ['auto', 0] }}>
          <img
            src={`${imagePrefix || ''}/cats/${category.id}.png`}
            alt={category.id}
            sx={imageStyles}
          />
        </Box>
        <Box sx={{ mx: ['auto', 0], mt: [7, 0, 0] }}>
          <Styled.h2>{category.name}</Styled.h2>
          <Styled.p sx={{ maxWidth: ['100%', '70%', '70%'] }}>
            {category.description}
          </Styled.p>
        </Box>
      </Grid>
      <Divider />
      {category.subcategories && (
        <Section
          title=""
          description={`${category.subcategories.length} Subcategories`}
          items={category.subcategories.map(subcat => {
            return {
              name: subcat.name,
              description: `${
                subcat.projects ? subcat.projects.length : 0
              } projects`,
              image: `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/cats/${
                subcat.id
              }.png`,
              to: `/category/${subcat.id}`,
            }
          })}
          variant="category"
        />
      )}
      <Grid columns={[1, 2, 2]} mb={1} mt={6} sx={{ alignItems: 'center' }}>
        <Box ref={viewRef}>
          <Styled.h3>Projects</Styled.h3>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {allProjects().length} Projects -{' '}
            {challengedProjects && (
              <span>{challengedProjects.length} Challenges</span>
            )}
          </Styled.p>
        </Box>
        {allProjects().length > 0 && (
          <Switcher
            selected={selected}
            setSelected={value => setSelected(value)}
          />
        )}
      </Grid>
      <Section
        items={allProjects().map(project => {
          return {
            ...project,
            description: project.description.slice(0, 40) + '...',
            to: `/project/${project.id}`,
            category:
              project.categories.length > 0 ? project.categories[0].name : '',
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
}

export default Category
