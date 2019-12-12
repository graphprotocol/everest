/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'

import Layout from '../components/Layout'

const About = ({ data }) => {
  return (
    <Layout>
      <Box>
        <Styled.p>Everest is the greatest project ever.</Styled.p>
      </Box>
    </Layout>
  )
}

export default About
