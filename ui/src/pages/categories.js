/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import { useQuery } from '@apollo/react-hooks'

import categories from '../data/categories.json'

import { CATEGORIES_QUERY } from '../utils/apollo/queries'
import Section from '../components/Section'

const Categories = () => {
  const { loading, data, error } = useQuery(CATEGORIES_QUERY)

  if (loading) {
    // TODO: add loading indicator
    return <div />
  }

  if (error) {
    console.error('Error getting categories: ', error)
    return <div />
  }

  return (
    <Box>
      <Box>
        <Styled.h2>Categories</Styled.h2>
        <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
          {categories.length} Categories
        </Styled.p>
      </Box>
      <Section
        items={
          data &&
          data.categories.map(cat => {
            return {
              name: cat.name,
              description: cat.subcategories
                ? `${cat.subcategories.length} PROJECTS`
                : '0 PROJECTS',
              image: `/categories/${cat.slug}.png`,
              to: `/category/${cat.slug}`,
            }
          })
        }
        variant="category"
      />
    </Box>
  )
}

export default Categories
