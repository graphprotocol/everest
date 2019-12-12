/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import { graphql } from 'gatsby'

import Layout from '../components/Layout'
import Section from '../components/Section'

const Category = ({ pageContext }) => {
  return (
    <Layout>
      <Box>
        <Styled.h1>{pageContext.name}</Styled.h1>
        <Styled.p>{pageContext.description}</Styled.p>
      </Box>
    </Layout>
  )
}

export default Category
