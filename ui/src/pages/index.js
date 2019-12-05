/** @jsx jsx */
import { jsx, Styled } from 'theme-ui'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import styled from 'styled-components'
import { Grid } from '@theme-ui/components'
import { Flex, Box } from 'theme-ui'

import Layout from '../components/Layout'
import Stats from '../components/Stats'
import Button from '../components/Button'
import Card from '../components/Card'
import Link from '../components/Link'
import categories from '../data/categories.json'
import Arrow from '../images/arrow.svg'

const Image = styled.div`
  background: url(/images/mountain.png) no-repeat 50% 50%;
  background-size: cover;
  width: 100%;
  height: 344px;
`

const Index = ({ data }) => {
  const stats = [
    { title: 'Projects', value: '150' },
    { title: 'Registry Value (ETH)', value: '150,000' },
    { title: 'Issued Shares', value: '350' }
  ]
  return (
    <Layout>
      <Grid gap={[2, 2, 6]} columns={[1, null, 2]}>
        <Box>
          <Styled.h1>
            Universally <br />
            shared <span sx={{ color: 'secondary' }}>projects</span> registry
          </Styled.h1>
          <Styled.h6 sx={{ marginTop: 4 }}>
            Every project starts with a mission. Our mission is to catalyze the
            shift to Web3 by creating the first decentralized registry to
            provide ongoing utility to the crypto community.
          </Styled.h6>
          <Grid columns={['max-content', 1]} mt={[2, 2, 5]} mb={[2, 2, 5]}>
            <Button to="/project/new" text="Add project" variant="primary" />
          </Grid>
        </Box>
        <Box>
          <Image />
        </Box>
      </Grid>
      <Stats stats={stats} />
      <Grid sx={dividerStyles} mt={[3, 6]} mb={[3, 6]} />
      <Grid mt={7} mb={7}>
        <Box sx={{ width: ['100%', '50%'] }}>
          <Styled.h3 sx={{ color: 'primary' }}>Categories</Styled.h3>
          <Styled.p>
            All projects belong to at least one category. Categories are also
            curated in a decentralized way.
          </Styled.p>
        </Box>
        <Grid columns={[1, 2, 4]}>
          {categories.slice(0, 10).map(category => (
            <Card title={category} subtitle="24 projects" variant="category" />
          ))}
        </Grid>
        <Link to="/categories">
          View all Categories
          <Arrow sx={{ verticalAlign: 'middle', marginLeft: 2 }} />
        </Link>
      </Grid>

      <Grid mt={7} mb={7}>
        <Box sx={{ width: ['100%', '50%'] }}>
          <Styled.h3 sx={{ color: 'primary' }}>Recent Projects</Styled.h3>
          <Styled.p>
            These projects were recently added by members of the community.
          </Styled.p>
        </Box>
        <Grid columns={[2, 6]} gap={0}>
          {data.everest.projects.map(project => {
            return (
              <Card
                title={project.name}
                subtitle={project.description.slice(0, 20) + '...'}
                variant="project"
              />
            )
          })}
        </Grid>
        <Link to="/projects">
          View all Projects
          <Arrow sx={{ verticalAlign: 'middle', marginLeft: 2 }} />
        </Link>
      </Grid>

      <Grid mt={7} mb={7}>
        <Box sx={{ width: ['100%', '50%'] }}>
          <Styled.h3 sx={{ color: 'primary' }}>Active Challenges</Styled.h3>
          <Styled.p>
            These projects and categories were recently challanged by members of
            the community.
          </Styled.p>
        </Box>
        <Grid columns={[2, 6]} gap={0}>
          {data.everest.projects.map(project => (
            <Card
              title={project.name}
              subtitle={project.description.slice(0, 20) + '...'}
              variant="project"
            />
          ))}
        </Grid>
        <Link to="/challenges">
          View all Challenges
          <Arrow sx={{ verticalAlign: 'middle', marginLeft: 2 }} />
        </Link>
      </Grid>

      <Grid sx={dividerStyles} mt={[3, 6]} mb={[3, 6]} />
    </Layout>
  )
}

const dividerStyles = {
  height: '2px',
  width: '100%',
  border: '1px solid #cfcfcf'
}

Index.propTypes = {
  data: PropTypes.object.isRequired
}

export default Index

export const query = graphql`
  query everest {
    everest {
      projects {
        id
        name
        description
        owner {
          id
          name
        }
      }
    }
  }
`
