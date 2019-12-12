/** @jsx jsx */
import { Fragment } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { convertDate } from '../utils/helpers/date'
import { formatNumber } from '../utils/helpers/number'
import Layout from '../components/Layout'
import Divider from '../components/Divider'
import DataRow from '../components/DataRow'
import ProjectImage from '../images/project-placeholder.svg'
import UserImage from '../images/user-placeholder.svg'

const PROJECT_QUERY = gql`
  query everestProject($id: ID!) {
    project(where: { id: $id }) {
      id
      name
      description
      categories
      createdAt
      reputation
      isChallenged
      website
      twitter
      github
      image
      avatar
      owner {
        id
        name
      }
    }
  }
`

const Project = ({ location }) => {
  const projectId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId
    }
  })
  let project = data && data.project
  return (
    <Layout>
      {loading ? (
        <Styled.p>Loading</Styled.p>
      ) : (
        <Fragment>
          <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
            <Grid sx={{ gridTemplateColumns: [1, '120px 1fr'] }}>
              <Box>
                {project.avatar ? (
                  <img
                    src={project.avatar}
                    alt="Project avatar"
                    sx={projectLogoStyle}
                  />
                ) : (
                  <ProjectImage sx={projectLogoStyle} />
                )}
              </Box>
              <Box>
                <p sx={{ variant: 'text.display' }}>
                  {project.categories.join(', ')}
                </p>
                <Styled.h2>{project.name}</Styled.h2>
              </Box>
            </Grid>
            <Grid columns={[1, 3, 3]} mt={[5, 5, 0]}>
              <Box>
                <p sx={{ variant: 'text.displaySmall' }}>Rep</p>
                <p sx={{ variant: 'text.displayBig' }}>
                  {formatNumber(project.reputation)}
                </p>
              </Box>
              <Box>
                <p sx={{ variant: 'text.displaySmall' }}>Date Added</p>
                <p sx={{ variant: 'text.displayBig' }}>
                  {convertDate(project.createdAt)}
                </p>
              </Box>
              <Grid sx={{ gridTemplateColumns: '50px 1fr' }}>
                <Box>
                  {project.owner.image ? '' : <UserImage sx={userImageStyle} />}
                </Box>
                <Box>
                  <p sx={{ variant: 'text.displaySmall' }}>Owner</p>
                  <p sx={{ variant: 'text.display' }}>{project.owner.name}</p>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Divider />
          <Grid columns={[1, 1, 2]} gap={3}>
            <Box sx={{ margin: ['auto', 'auto', 0] }}>
              <Styled.p sx={{ maxWidth: '504px', width: '100%' }}>
                {project.description}
              </Styled.p>
              <Box sx={{ mt: 5 }}>
                <DataRow name="ID" value={project.id} />
                {project.website && (
                  <DataRow
                    name="Website"
                    value={project.website}
                    href={project.website}
                  />
                )}
                {project.twitter && (
                  <DataRow
                    name="Twitter"
                    value={project.twitter}
                    href={project.twitter}
                  />
                )}
                {project.github && (
                  <DataRow
                    name="Github"
                    value={project.github}
                    href={project.github}
                  />
                )}
              </Box>
            </Box>
            <Box
              sx={{
                ...imageStyles,
                backgroundImage: `url(${project.image})`,
                margin: ['auto', 'auto', 0]
              }}
            ></Box>
          </Grid>
        </Fragment>
      )}
    </Layout>
  )
}

const projectLogoStyle = { height: '96px', width: '96px', borderRadius: '50%' }
const userImageStyle = { height: '43px', width: '43px', borderRadius: '50%' }
const imageStyles = {
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '50% 50%',
  backgroundSize: 'cover',
  width: '100%',
  maxWidth: ['540px', '540px', '612px'],
  height: ['280px', '318px']
}

export default Project
