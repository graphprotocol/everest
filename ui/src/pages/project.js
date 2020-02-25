/** @jsx jsx */
import { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@graphprotocol/mutations-apollo-react'

import { convertDate } from '../utils/helpers/date'

import { PROJECT_QUERY, USER_PROJECTS_QUERY } from '../utils/apollo/queries'
import { REMOVE_PROJECT } from '../utils/apollo/mutations'

import Divider from '../components/Divider'
import DataRow from '../components/DataRow'
import Button from '../components/Button'
import TabView from '../components/TabView'
import Link from '../components/Link'
import Menu from '../components/Menu'
import MultiSelect from '../components/Filters/MultiSelect'

import ProjectImage from '../images/project-placeholder.svg'
import UserImage from '../images/profile-placeholder.svg'
import Close from '../images/close.svg'

const defaultAvatar = () => {
  const baseUri = `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/profiles/profile`
  // pick a pseudorandom number between 1 and 24
  const num = Math.floor(Math.random() * 24 + 1)
  return `${baseUri}${num}.png`
}

const Project = ({ location }) => {
  const [showChallenge, setShowChallenge] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showDelegate, setShowDelegate] = useState(false)
  const [challengeDescription, setChallengeDescription] = useState('')
  const [transferAddress, setTransferAddress] = useState('')
  const [delegateAddress, setDelegateAddress] = useState('')
  const [isKeepOpen, setIsKeepOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const projectId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const challengeProject = () => {
    console.log('CHALLENGE PROJECT')
    // TODO: call mutations
  }

  const delegateProject = async () => {
    console.log('DELEGATE PROJECT')
    // TODO: call mutations
  }

  const transferOwnership = async () => {
    console.log('TRANSFER OWNERSHIP')
    // TODO: call mutations
  }

  const setChallengeData = value => {
    setChallengeDescription(value)
  }

  const voteOnProject = () => {
    // TODO: call mutatioins
  }

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const { data: userData } = useQuery(USER_PROJECTS_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const [
    removeProject,
    {
      data: mutationData,
      loading: mutationLoading,
      error: mutationError,
      state,
    },
  ] = useMutation(REMOVE_PROJECT)

  if (loading && !error) {
    return <Styled.p>Loading</Styled.p>
  }

  if (error) {
    console.error('Error getting the project: ', error)
    return (
      <Styled.h3>Something went wrong - can&apos;t find a project </Styled.h3>
    )
  }

  let project = data && data.project

  if (project === null) {
    // TODO: Handle this better
    console.log("This project doesn't exist anymore")
    return (
      <Box>
        <Styled.h3>This project no longer exists</Styled.h3>
      </Box>
    )
  }

  return (
    <Grid>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid sx={{ gridTemplateColumns: [1, '120px 1fr'] }}>
          <Box>
            {project.avatar ? (
              <img
                src={`${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${project.avatar}`}
                alt="Project avatar"
                sx={projectLogoStyle}
              />
            ) : (
              <img
                src={defaultAvatar()}
                alt="Project avatar"
                sx={projectLogoStyle}
              />
            )}
          </Box>
          <Box>
            <p sx={{ variant: 'text.large' }}>
              {project.categories.join(', ')}
            </p>
            <Styled.h2>{project.name}</Styled.h2>
          </Box>
        </Grid>
        <Grid columns={[1, 2, 2]} mt={[5, 5, 0]} sx={{ alignItems: 'center' }}>
          <Box>
            <p sx={{ variant: 'text.small' }}>Date Added</p>
            <p sx={{ variant: 'text.huge' }}>
              {convertDate(project.createdAt)}
            </p>
          </Box>
          <Grid
            sx={{ gridTemplateColumns: '50px 1fr 30px', alignItems: 'center' }}
          >
            <Box>
              <UserImage sx={userImageStyle} />
            </Box>
            <Box>
              <p sx={{ variant: 'text.small' }}>Owner</p>
              <p sx={{ variant: 'text.large' }}>
                {project.owner && project.owner.name}
              </p>
            </Box>
            <Menu
              items={[
                {
                  text: 'Challenge',
                  handleSelect: () => {
                    setShowChallenge(true)
                    if (!showChallenge) {
                      setShowDelegate(false)
                      setShowTransfer(false)
                    }
                  },
                  icon: '/challenge.png',
                },
                {
                  text: 'Share',
                  handleSelect: value => console.log('value: ', value),
                  icon: '/share.png',
                },
                {
                  text: 'Remove',
                  handleSelect: () => {
                    removeProject({ variables: { projectId } })
                  },
                },
              ]}
            >
              {showChallenge ? (
                <Close
                  onClick={async () => {
                    await setShowChallenge(false)
                    const $el = document.querySelector('[alt="dots icon"]')
                    if ($el) {
                      $el.click()
                    }
                  }}
                  sx={{
                    fill: 'white',
                    cursor: 'pointer',
                    backgroundColor: 'secondary',
                    borderRadius: '50%',
                    p: 4,
                    width: '22px',
                    height: '22px',
                    transition: 'all 0.3s ease',
                  }}
                />
              ) : (
                <img
                  src={`${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/dots.png`}
                  sx={{
                    pt: 1,
                    pl: 2,
                    width: '24px',
                    transform: 'rotate(90deg)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  alt="dots"
                />
              )}
            </Menu>
          </Grid>
        </Grid>
      </Grid>
      {showChallenge && (
        <TabView
          fieldType="textarea"
          charsCount={300}
          title="Desription"
          placeholder="Challenge Description"
          heading={`Challenge ${project.name}`}
          description="lala"
          value={challengeDescription}
          setValue={setChallengeData}
          text="Challenge"
          icon="challenge.png"
          handleClick={challengeProject}
          showFilters={true}
          items={userData ? userData.user.projects : []}
        />
      )}
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
        </Box>
        <Box sx={{ margin: ['32px auto', '32px auto', 0] }}>
          {project.isChallenged && (
            <Box>
              <Styled.h5 sx={{ color: 'secondary', mb: 4 }}>
                Active Challenge
              </Styled.h5>
              <Box>
                <p sx={{ variant: 'text.small' }}>Description</p>
                <Styled.p>Blah blah - challenge copy</Styled.p>
              </Box>

              <Grid columns={3} gap={3} sx={{ my: 4 }}>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Challenge ends</p>
                  <p sx={{ variant: 'text.huge' }}>3d 6h</p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Voters</p>
                  <p sx={{ variant: 'text.huge' }}>{project.totalVotes}</p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Challenged by</p>
                  <Link to={`/profile/${project.owner.id}`}>
                    {`${project.owner.id.slice(0, 6)}-${project.owner.id.slice(
                      -6,
                    )}`}
                  </Link>
                </Box>
              </Grid>
              {!project.isChallenged ? (
                <Fragment>
                  <Styled.h6>
                    This challenge is over. Process this challenge to resolve it
                    and earn a reward.
                  </Styled.h6>
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
                      text="Process"
                      sx={{ border: '1px solid #4C66FF' }}
                      onClick={() => voteOnProject('yes')}
                    />
                  </Grid>
                </Fragment>
              ) : (
                <Fragment>
                  <Styled.h6>
                    What would you like to happen to this listing?
                  </Styled.h6>
                  <Grid
                    columns={2}
                    sx={{
                      mt: 4,
                      mb: 6,
                      gridTemplateColumns: 'max-content max-content',
                    }}
                  >
                    <MultiSelect
                      setValue={projects => voteOnProject(projects, 'keep')}
                      title="Vote on behalf of"
                      subtitle="You can select multiple projects"
                      items={userData ? userData.user.projects : []}
                      variant="round"
                      setOpen={value => {
                        setIsKeepOpen(value)
                      }}
                      styles={{
                        pointerEvents: isRemoveOpen ? 'none' : 'all',
                        cursor: isRemoveOpen ? 'auto' : 'pointer',
                      }}
                    >
                      <Button
                        variant="secondary"
                        text="Keep"
                        sx={{
                          ...buttonStyles,
                          backgroundColor: isKeepOpen ? 'secondary' : 'white',
                          color: isKeepOpen ? 'white' : 'secondary',
                          opacity: isRemoveOpen ? 0.48 : 1,
                        }}
                        icon={isKeepOpen ? `keep-white.png` : `keep.png`}
                      />
                    </MultiSelect>
                    <MultiSelect
                      setValue={projects => voteOnProject(projects, 'remove')}
                      title="Vote on behalf of"
                      subtitle="You can select multiple projects"
                      items={userData ? userData.user.projects : []}
                      variant="round"
                      setOpen={value => {
                        setIsRemoveOpen(value)
                      }}
                      styles={{
                        pointerEvents: isKeepOpen && 'none',
                        cursor: isKeepOpen && 'auto',
                      }}
                    >
                      <Button
                        variant="secondary"
                        text="Remove"
                        sx={{
                          ...buttonStyles,
                          backgroundColor: isRemoveOpen ? 'secondary' : 'white',
                          color: isRemoveOpen ? 'white' : 'secondary',
                          opacity: isKeepOpen ? 0.48 : 1,
                        }}
                        icon={isRemoveOpen ? `remove-white.png` : `remove.png`}
                      />
                    </MultiSelect>
                  </Grid>
                </Fragment>
              )}
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
    </Grid>
  )
}

const projectLogoStyle = {
  height: '96px',
  width: '96px',
  borderRadius: '50%',
  objectFit: 'contain',
}
const userImageStyle = { height: '43px', width: '43px', borderRadius: '50%' }
const imageStyles = {
  backgroundRepeat: 'no-repeat',
  backgroundPosition: '50% 50%',
  backgroundSize: 'cover',
  width: '100%',
  maxWidth: ['540px', '540px', '612px'],
  height: ['280px', '318px'],
}

const buttonStyles = {
  border: '1px solid',
  borderColor: 'secondary',
  maxWidth: '140px',
  transition: 'all 0.3s ease',
  '& img': {
    width: '16px',
    height: '16px',
  },
}

Project.propTypes = {
  pageContext: PropTypes.any,
  location: PropTypes.any,
}

export default Project
