/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import { convertDate } from '../utils/helpers/date'
import { formatNumber } from '../utils/helpers/number'

import Layout from '../components/Layout'
import Divider from '../components/Divider'
import DataRow from '../components/DataRow'
import Button from '../components/Button'
import TabView from '../components/TabView'
import Link from '../components/Link'

import ProjectImage from '../images/project-placeholder.svg'
import UserImage from '../images/profile-placeholder.svg'
import { PROJECT_QUERY } from '../utils/queries'

const Project = ({ location }) => {
  const [showChallenge, setShowChallenge] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showDelegate, setShowDelegate] = useState(false)
  const [challengeDescription, setChallengeDescription] = useState('')
  const [transferAddress, setTransferAddress] = useState('')
  const [delegateAddress, setDelegateAddress] = useState('')

  const projectId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const challengeProject = () => {
    console.log('CHALLENGE PROJECT')
    // TODO: Call contract function
  }

  const delegateProject = () => {
    console.log('DELEGATE PROJECT')
    // TODO: Call contract function
  }

  const transferOwnership = () => {
    console.log('TRANSFER OWNERSHIP')
    // TODO: Call contract function
  }

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  if (loading && !error) {
    return (
      <Layout>
        <Styled.p>Loading</Styled.p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Styled.h3>Something went wrong - can't find a project </Styled.h3>
      </Layout>
    )
  }

  let project = data && data.project

  return (
    <Layout>
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
        <Box sx={{ margin: ['auto', 'auto', 0], position: 'relative' }}>
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
          <Grid
            sx={{
              gridTemplateColumns: 'min-content min-content min-content',
              mt: 6,
              position: project.image ? 'absolute' : 'static',
              bottom: 0,
            }}
            gap={0}
          >
            <Box
              sx={{
                textAlign: ['center', 'center', 'left'],
                mr: 4,
              }}
            >
              <Button
                disabled={false}
                variant={'secondary'}
                to={`/edit/${projectId}`}
                text="Edit"
                icon={'edit-icon.svg'}
                sx={{ margin: ['auto', 'auto', 0] }}
              />
            </Box>
            {/*  <Box sx={{ mr: 4, textAlign: ['center', 'center', 'left'] }}>
              <Button
                disabled={false}
                variant={showChallenge ? 'primary' : 'secondary'}
                onClick={e => {
                  setShowChallenge(!showChallenge)
                  if (!showChallenge) {
                    setShowDelegate(false)
                    setShowTransfer(false)
                  }
                }}
                text="Challenge"
                icon={showChallenge ? 'challenging.png' : 'challenge.png'}
                sx={{ margin: ['auto', 'auto', 0] }}
              />
              </Box> */}
            <Box sx={{ mr: 4, textAlign: ['center', 'center', 'left'] }}>
              <Button
                disabled={false}
                variant={showTransfer ? 'primary' : 'secondary'}
                onClick={e => {
                  setShowTransfer(!showTransfer)
                  if (!showTransfer) {
                    setShowChallenge(false)
                    setShowDelegate(false)
                  }
                }}
                text="Transfer"
                icon={
                  showTransfer ? 'transferring-icon.svg' : 'transfer-icon.svg'
                }
                sx={{ margin: ['auto', 'auto', 0] }}
              />
            </Box>
            <Box sx={{ mr: 4, textAlign: ['center', 'center', 'left'] }}>
              <Button
                disabled={false}
                variant={showDelegate ? 'primary' : 'secondary'}
                onClick={e => {
                  setShowDelegate(!showDelegate)
                  if (!showDelegate) {
                    setShowChallenge(false)
                    setShowTransfer(false)
                  }
                }}
                text="Delegate"
                icon={
                  showDelegate ? 'delegating-icon.svg' : 'delegate-icon.svg'
                }
                sx={{ margin: ['auto', 'auto', 0] }}
              />
            </Box>
          </Grid>
        </Box>
        <Box sx={{ margin: ['32px auto', '32px auto', 0] }}>
          {project.isChallenged && (
            <Box>
              <Styled.h5 sx={{ color: 'secondary', mb: 4 }}>
                Active Challenge
              </Styled.h5>
              <Grid columns={3} gap={3} sx={{ my: 4 }}>
                <Box>
                  <p sx={{ variant: 'text.displaySmall' }}>Challenge ends</p>
                  <p sx={{ variant: 'text.displayBig' }}>3d 6h</p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.displaySmall' }}>Voters</p>
                  <p sx={{ variant: 'text.displayBig' }}>
                    {project.totalVotes}
                  </p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.displaySmall' }}>Challenged by</p>
                  <Link to={`/profile/${project.owner.id}`}>
                    {`${project.owner.id.slice(0, 6)}-${project.owner.id.slice(
                      -6,
                    )}`}
                  </Link>
                </Box>
              </Grid>
              <Box>
                <p sx={{ variant: 'text.displaySmall' }}>Description</p>
                <Styled.p>Blah blah - needs copy</Styled.p>
              </Box>
              <Grid
                columns={2}
                sx={{
                  mt: 4,
                  mb: 6,
                  gridTemplateColumns: 'max-content max-content',
                }}
              >
                <Button
                  variant="secondary"
                  text="Keep"
                  sx={{ border: '1px solid #4C66FF', maxWidth: '140px' }}
                  icon={'thumbs-up.png'}
                />
                <Button
                  variant="secondary"
                  text="Remove"
                  sx={{ border: '1px solid #4C66FF', maxWidth: '160px' }}
                  icon={'thumbs-down.png'}
                />
              </Grid>
            </Box>
          )}
          {project.image && (
            <Box
              sx={{
                ...imageStyles,
                backgroundImage: `url(${project.image})`,
                margin: ['auto', 'auto', 0],
              }}
            ></Box>
          )}
        </Box>
      </Grid>

      {showChallenge && (
        <TabView
          fieldType="textarea"
          charsCount={300}
          title="Desription"
          placeholder="Challenge Description"
          heading={`Remove ${project.name}`}
          description="lala"
          value={challengeDescription}
          setValue={setChallengeDescription}
          text="Challenge"
          icon="challenge.png"
          handleClick={challengeProject}
        />
      )}
      {showTransfer && (
        <TabView
          fieldType="input"
          charsCount={42}
          title="Ethereum address"
          placeholder="Enter address"
          heading={`Transfer ${project.name}`}
          description="PLACEHOLDER"
          value={transferAddress}
          setValue={setTransferAddress}
          text="Transfer"
          icon="transfer-icon.svg"
          handleClick={transferOwnership}
        />
      )}
      {showDelegate && (
        <TabView
          fieldType="input"
          charsCount={42}
          title="Ethereum address"
          placeholder="Enter address"
          heading={`Delegate ${project.name}`}
          description="PLACEHOLDER"
          value={delegateAddress}
          setValue={setDelegateAddress}
          text="Delegate"
          icon="delegate-icon.svg"
          handleClick={delegateProject}
        />
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
  height: ['280px', '318px'],
}

export default Project
