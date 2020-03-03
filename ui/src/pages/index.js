/** @jsx jsx */
import { Fragment, useState } from 'react'
import { jsx, Styled, Box } from 'theme-ui'
import { navigate } from 'gatsby'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import { useWeb3React } from '../utils/hooks'
import { getAddress } from '../services/ethers'
import {
  CATEGORIES_QUERY,
  PROJECTS_QUERY,
  TOTALS_QUERY,
} from '../utils/apollo/queries'

import Link from '../components/Link'
import Stats from '../components/Stats'
import Button from '../components/Button'
import Section from '../components/Section'
import Divider from '../components/Divider'
import Modal from '../components/Modal'

const Index = () => {
  const { account } = useWeb3React()
  const [showModal, setShowModal] = useState(false)
  const openModal = () => setShowModal(true)
  const closeModal = () => {
    setShowModal(false)
    // navigate('/projects/new')
  }

  const { data: categories } = useQuery(CATEGORIES_QUERY)
  const { data: projects } = useQuery(PROJECTS_QUERY, {
    variables: {
      orderBy: 'createdAt',
      orderDirection: 'desc',
    },
  })
  const { data: total } = useQuery(TOTALS_QUERY)

  // TODO: update these
  const stats = [
    { title: 'Projects', value: total ? total.projectCount.toString() : '150' },
    { title: 'Categories', value: '64' },
    { title: 'Registry Value (DAI)', value: '150,000' },
  ]

  const challengedProjects = projects
    ? projects.projects.filter(project => project.isChallenged === true)
    : []

  return (
    <Grid>
      <Grid gap={[2, 2, 6]} columns={[1, null, 2]}>
        <Box>
          <Styled.h1>
            Universally <br />
            shared{' '}
            <Link
              to="/projects"
              sx={{
                fontSize: 'inherit',
                display: 'inline',
              }}
            >
              projects
            </Link>{' '}
            registry
          </Styled.h1>
          <Styled.h6 sx={{ marginTop: 4 }}>
            Every project starts with a mission. Our mission is to catalyze the
            shift to Web3 by creating the first decentralized registry to
            provide ongoing utility to the crypto community.
          </Styled.h6>
          <Grid
            columns={1}
            mt={[7, 7, 5]}
            mb={[6, 6, 5]}
            sx={{ justifyContent: ['center', 'start', 'start'] }}
          >
            {showModal ? (
              <Modal showModal={showModal} closeModal={closeModal}>
                <Button
                  onClick={openModal}
                  text="Add a project"
                  variant="primary"
                />
              </Modal>
            ) : (
              <Button
                onClick={async () =>
                  account || (await getAddress())
                    ? navigate('/projects/new')
                    : setShowModal(true)
                }
                text="Add a project"
                variant="primary"
              />
            )}
          </Grid>
        </Box>
        <Divider sx={{ display: ['block', 'none', 'none'], mb: 0 }} />
        <Box
          sx={{
            ...imageStyles,
            backgroundImage: 'url(./mountain.jpg)',
          }}
        />
      </Grid>
      <Grid sx={{ maxWidth: '1100px', width: '100%' }} mx="auto" my={8}>
        <Stats stats={stats} />
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Section
        title="Categories"
        description="All projects belong to at least one category. Categories are also
      curated in a decentralized way."
        items={
          categories
            ? categories.categories.slice(0, 10).map(category => {
                return {
                  name: category.id,
                  description: '24 projects',
                  image: `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/cats/${
                    category.id
                  }.png`,
                  to: `/category/${category.id}`,
                }
              })
            : []
        }
        linkTo="/categories"
        linkText="View all Categories"
        variant="category"
      />
      <Section
        title="Recent Projects"
        description="These projects were recently added by members of the community."
        items={
          projects
            ? projects.projects.slice(0, 6).map(project => {
                return {
                  name: project.name,
                  description:
                    project.description.length > 30
                      ? project.description.slice(0, 26) + '...'
                      : project.description,
                  to: `/project/${project.id}`,
                  image: project.image,
                  category:
                    project.categories.length > 0
                      ? project.categories[0].name
                      : '',
                }
              })
            : []
        }
        linkTo="/projects"
        linkText="View all Projects"
        variant="project"
      />
      <Divider />
      <Grid
        columns={[1, 2, 2]}
        gap={[1, 2, 6]}
        sx={{ alignItems: 'center', mb: [5, 7, 7], mt: [5, 7, 7] }}
      >
        <Box
          sx={{
            ...imageStyles,
            height: '246px',
            backgroundSize: 'contain',
            backgroundImage: 'url(./binoculars.png)',
            filter: 'none',
            boxShadow: 'none',
            order: [2, 1, 1],
          }}
        />
        <Box>
          <Styled.h4>Why curation</Styled.h4>
          <Styled.p sx={{ lineHeight: '1.5rem', mt: 4 }}>
            Everest is building toward a decentralized future where no
            privileged group has control over public data. Curation allows
            diverse stakeholders to agree on the contents of a shared registry
            with neutrality.
            <br />
            <br />
            To add a project to the registry you must pay a 10 DAI listing fee.
            The listing fee helps ensure the list&apos;s quality.
            <br />
            <br /> Anyone can challenge a listing by putting DAI at stake. With
            these tools we can build consensus on a shared registry without
            giving anyone control over the data. Let the decentralized future
            begin!
          </Styled.p>
        </Box>
      </Grid>
      <Divider />
      {challengedProjects.length > 0 && (
        <Fragment>
          <Section
            title="Active Challenges"
            description="These projects were recently challanged by members of
        the community."
            items={challengedProjects.map(project => {
              return {
                name: project.name,
                description: project.description.slice(0, 20) + '...',
                to: `/project/${project.id}`,
                image: project.image,
                category:
                  project.categories.length > 0 ? project.categories[0] : '',
                isChallenged: project.isChallenged,
              }
            })}
            linkTo="/projects"
            linkText="View all Challenges"
            variant="project"
          />
          <Divider />
        </Fragment>
      )}
      <Grid gap={[2, 6, 10]} columns={[1, 2, 2]} mt={7}>
        <Box
          sx={{
            ...imageStyles,
            backgroundImage: 'url(./bottom.png)',
            order: 0,
          }}
        />
        <Box sx={{ maxWidth: '396px' }}>
          <Styled.h4>Be part of conquering Everest!</Styled.h4>
          <Styled.p sx={{ marginTop: 4, lineHeight: '1.5rem' }}>
            Having a complete and up-to-date list of projects is a major
            achievement on the road to decentralization.
          </Styled.p>
          <Grid columns={['max-content', 1]} mt={[6, 6, 5]} mb={[6, 6, 5]}>
            <Button to="/projects/new" text="Add a project" variant="primary" />
          </Grid>
        </Box>
      </Grid>
    </Grid>
  )
}

const imageStyles = {
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '50% 50%',
  backgroundSize: 'cover',
  width: '100%',
  height: ['280px', '344px'],
  position: 'relative',
  filter: 'drop-shadow(24px 24px 24px rgba(9,6,16,0.5))',
  boxShadow: '24px 24px 24px rgba(76,102,255,0.12)',
  display: ['none', 'block', 'block'],
}

Index.propTypes = {}

export default Index
