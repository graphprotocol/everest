/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import { Grid } from '@theme-ui/components'

import Layout from '../components/Layout'
import Stats from '../components/Stats'
import Button from '../components/Button'
import Section from '../components/Section'
import Divider from '../components/Divider'
import categories from '../../categories.json'

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
        <Box
          sx={{
            ...imageStyles,
            backgroundImage: 'url(./mountain.png)'
          }}
        />
      </Grid>
      <Grid sx={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Stats stats={stats} />
      </Grid>
      <Divider />
      <Section
        title="Categories"
        description="All projects belong to at least one category. Categories are also
      curated in a decentralized way."
        items={categories.slice(0, 10).map(cat => {
          return {
            name: cat.name,
            description: '24 projects',
            imageBase: '/categories'
          }
        })}
        to="/categories"
        linkText="View all Categories"
        variant="category"
      />

      <Section
        title="Recent Projects"
        description="These projects were recently added by members of the community."
        items={data.everest.projects.map(project => {
          return {
            name: project.name,
            description: project.description.slice(0, 20) + '...'
          }
        })}
        to="/projects"
        linkText="View all Projects"
        variant="project"
      />
      {/* TODO: Combine projects and categories */}
      <Section
        title="Active Challenges"
        description="These projects and categories were recently challanged by members of
        the community."
        items={data.everest.projects.map(project => {
          return {
            name: project.name,
            description: project.description.slice(0, 20) + '...'
          }
        })}
        to="/projects"
        linkText="View all Challenges"
        variant="project"
      />
      <Divider />
      <Grid columns={[1, 2, 2]} gap={[1, 2, 6]}>
        <Box>
          <Styled.h3>Why curation</Styled.h3>
          <Styled.p sx={{ fontSize: '0.875rem', lineHeight: '1.5rem' }}>
            Everest is building toward a decentralized future where no
            privileged group has control over public data. Curation allows
            diverse stakeholders to agree on the contents of a shared registry
            with neutrality.
            <br />
            <br />
            To add a project to the registry you must submit a $10 listing fee
            paid in ETH. The listing fee helps ensure the list's quality.
            <br />
            <br /> Anyone can challenge a listing by putting ETH at stake. With
            these tools we can build consensus on a shared registry without
            giving anyone control over the data. Let the decentralized future
            begin!
          </Styled.p>
        </Box>
        <Box
          sx={{
            ...imageStyles,
            backgroundSize: 'contain',
            backgroundImage: 'url(./binoculars.png)',
            order: [-1, 1, 1]
          }}
        />
      </Grid>
      <Grid gap={[2, 2, 6]} columns={[1, null, 2]} mt={[2, 8]}>
        <Box
          sx={{
            ...imageStyles,
            backgroundImage: 'url(./bottom.png)'
          }}
        />
        <Box sx={{ maxWidth: '396px' }}>
          <Styled.h4>Be part of conquering Everest!</Styled.h4>
          <Styled.p
            sx={{ marginTop: 4, fontSize: '0.875rem', lineHeight: '1.5rem' }}
          >
            Having a complete and up-to-date list of projects is a major
            achievement on the road to decentralization.
          </Styled.p>
          <Grid columns={['max-content', 1]} mt={[2, 2, 5]} mb={[2, 2, 5]}>
            <Button to="/project/new" text="Add project" variant="primary" />
          </Grid>
        </Box>
      </Grid>
    </Layout>
  )
}

const imageStyles = {
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '50% 50%',
  backgroundSize: 'cover',
  width: '100%',
  height: ['280px', '344px']
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
