/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'

import categories from '../data/categories.json'

import Layout from '../components/Layout'
import Section from '../components/Section'

const Categories = ({ data }) => {
  return (
    <Layout>
      <Box>
        <Styled.h2>Categories</Styled.h2>
        <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
          {categories.length} Categories
        </Styled.p>
      </Box>
      <Section
        items={categories.map(cat => {
          return {
            name: cat.name,
            description: cat.subcategories
              ? `${cat.subcategories.length} projects`
              : '0 projects',
            image: `/categories/${cat.slug}.png`,
            to: `/category/${cat.slug}`,
          }
        })}
        variant="category"
      />
    </Layout>
  )
}

export default Categories
