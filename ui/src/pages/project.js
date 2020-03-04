/** @jsx jsx */
import { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import ThreeBox from '3box'
import client from '../utils/apollo/client'

import { convertDate } from '../utils/helpers/date'
import { defaultImage } from '../utils/helpers/utils'
import { useAccount } from '../utils/hooks'
import { remainingTime } from '../utils/helpers/date'

import { PROJECT_QUERY, USER_PROJECTS_QUERY } from '../utils/apollo/queries'
import {
  REMOVE_PROJECT,
  RESOLVE_CHALLENGE,
  CHALLENGE_PROJECT,
  VOTE_CHALLENGE,
} from '../utils/apollo/mutations'

import Divider from '../components/Divider'
import DataRow from '../components/DataRow'
import Button from '../components/Button'
import TabView from '../components/TabView'
import Link from '../components/Link'
import Menu from '../components/Menu'
import MultiSelect from '../components/Filters/MultiSelect'

import Close from '../images/close.svg'
import { navigate } from 'gatsby'

const Project = ({ location }) => {
  const { account } = useAccount()

  // client.resetStore()

  const [showChallenge, setShowChallenge] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showDelegate, setShowDelegate] = useState(false)
  const [challenge, setChallenge] = useState({ description: '', projectId: '' })
  const [transferAddress, setTransferAddress] = useState('')
  const [delegateAddress, setDelegateAddress] = useState('')
  const [isKeepOpen, setIsKeepOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [pendingVotes, setPendingVotes] = useState(false)
  const projectId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const { data: userData } = useQuery(USER_PROJECTS_QUERY, {
    variables: {
      id: account.toLowerCase(),
    },
  })

  let userProjects = userData ? userData.user.projects : []

  const [
    removeProject,
    // {
    //   data: mutationData,
    //   loading: mutationLoading,
    //   error: mutationError,
    //   state,
    // },
  ] = useMutation(REMOVE_PROJECT)

  const [resolveChallenge] = useMutation(RESOLVE_CHALLENGE)

  const [challengeProject] = useMutation(CHALLENGE_PROJECT)
  const [voteChallenge] = useMutation(VOTE_CHALLENGE, {
    client: client,
    onError: error => {
      console.error('Error voting on a challenge: ', error)
    },
    onCompleted: mydata => {
      setPendingVotes(false)
    },
  })

  useEffect(() => {
    async function getProfile() {
      if (data && data.project) {
        const threeBoxProfile = await ThreeBox.getProfile(data.project.owner.id)
        if (threeBoxProfile) {
          setOwnerName(threeBoxProfile.name)
        }
      }
    }
    getProfile()
  }, [data])

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
    return (
      <Box>
        <Styled.h3>This project no longer exists</Styled.h3>
      </Box>
    )
  }

  // If you are the owner of the current project
  // you can't vote on behalf of that project
  // if you already voted - you can't vote again
  if (project.currentChallenge) {
    let votes = []
    votes = project.currentChallenge.votes.map(vote => vote.id.slice(2))
    userProjects = userProjects.map(up => ({
      ...up,
      disabled: up.id === project.id || votes.includes(up.id),
    }))
  }

  const handleChallenge = () => {
    challengeProject({
      variables: {
        challengingProjectAddress: challenge.projectId,
        challengedProjectAddress: projectId,
        description: challenge.description,
      },
    })
  }

  const handleVoting = (projects, choice) => {
    let voteChoice = []
    let voters = []
    projects.forEach(project => {
      voteChoice.push(choice)
      voters.push(project.id)
    })
    setPendingVotes(true)
    voteChallenge({
      variables: {
        challengeId: project.currentChallenge.id,
        voteChoice: voteChoice,
        voters: voters,
      },
    })
  }

  const delegateProject = async () => {
    console.log('DELEGATE PROJECT')
    // TODO: call mutations
  }

  const transferOwnership = async () => {
    console.log('TRANSFER OWNERSHIP')
    // TODO: call mutations
  }

  const setChallengeData = async (field, value) => {
    await setChallenge(state => ({
      ...state,
      [field]: value,
    }))
  }

  const handleResolveChallenge = () => {
    const challengeId = project.currentChallenge.id
    resolveChallenge({ variables: { challengeId } })
  }

  let items = [
    {
      text: 'Share',
      handleSelect: value => console.log('value: ', value),
      icon: '/share.png',
    },
  ]

  if (account && project.owner && account.toLowerCase() === project.owner.id) {
    if (project.currentChallenge) {
      items = items.concat([
        {
          text: 'Edit',
          handleSelect: () => {
            navigate(`/edit/${projectId}`)
          },
          icon: '/edit.png',
        },
      ])
    } else {
      items = items.concat([
        {
          text: 'Edit',
          handleSelect: () => {
            navigate(`/edit/${projectId}`)
          },
          icon: '/edit.png',
        },
        {
          text: 'Remove',
          handleSelect: () => {
            removeProject({ variables: { projectId } })
          },
          icon: '/trash.png',
        },
      ])
    }
  } else if (userProjects.length > 0) {
    items = items.concat([
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
    ])
  }

  const isCompleted =
    project.currentChallenge &&
    remainingTime(project.currentChallenge.endTime) === '0d 0h 0m'

  return (
    <Grid sx={{ pb: project.currentChallenge ? '400px' : 0 }}>
      <Grid
        columns={[1, 1, 2]}
        gap={0}
        sx={{ alignItems: 'center' }}
        id="click"
      >
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
                src={defaultImage('profiles/profile')}
                alt="Project avatar"
                sx={projectLogoStyle}
              />
            )}
          </Box>
          <Box>
            <p sx={{ variant: 'text.large' }}>
              {project.categories && project.categories.length > 0
                ? project.categories.map((cat, index) => (
                    <Link to={`/category/${cat.id}`} key={index}>
                      {cat.name}
                      {index !== project.categories.length - 1 && (
                        <span>,&nbsp;</span>
                      )}
                    </Link>
                  ))
                : ''}
            </p>
            <Styled.h2>{project.name}</Styled.h2>
          </Box>
        </Grid>
        <Grid
          mt={[5, 5, 0]}
          sx={{
            alignItems: 'center',
            gridTemplateColumns: '200px max-content 1fr',
          }}
        >
          <Box>
            <p sx={{ variant: 'text.small' }}>Date Added</p>
            <p sx={{ variant: 'text.huge' }}>
              {convertDate(project.createdAt)}
            </p>
          </Box>
          <Grid
            sx={{
              gridTemplateColumns:
                project.owner && project.owner.image ? '50px 1fr' : '1fr',
              alignItems: 'center',
            }}
          >
            {project.owner && project.owner.image && (
              <Box>
                <img
                  src={project.owner.image}
                  sx={userImageStyle}
                  alt="profile"
                />
              </Box>
            )}
            <Box>
              <p sx={{ variant: 'text.small' }}>Owner</p>
              <Link
                sx={{ color: 'secondary', fontSize: '1.5rem' }}
                to={`/profile?id=${project.owner.id}`}
              >
                {ownerName
                  ? ownerName
                  : project.owner.id.slice(0, 6) +
                    '...' +
                    project.owner.id.slice(-6)}
              </Link>
            </Box>
          </Grid>
          {account && (
            <Menu items={items} sx={{ justifySelf: 'end' }}>
              {showChallenge ? (
                <Box
                  sx={{
                    p: 5,
                    borderRadius: '50%',
                    backgroundColor: 'secondary',
                    cursor: 'pointer',
                  }}
                >
                  <Close
                    onClick={async () => {
                      await setShowChallenge(false)
                      const $el = document.querySelector('#click  ')
                      if ($el) {
                        $el.click()
                      }
                    }}
                    sx={{
                      fill: 'white',
                      width: '22px',
                      height: '22 px',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Box>
              ) : (
                <img
                  src={`${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/dots.png`}
                  sx={{
                    pt: 1,
                    pl: 2,
                    width: '32px',
                    transform: 'rotate(90deg)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  alt="dots"
                />
              )}
            </Menu>
          )}
        </Grid>
      </Grid>
      {showChallenge && (
        <TabView
          fieldType="textarea"
          charsCount={300}
          title="Desription"
          placeholder="Challenge Description"
          heading={`Challenge ${project.name}`}
          description="Challenge a project on the Everest registry if there is incorrect information or the project should be removed. Refer to the Charter as a guide about Everest's principles.
          To challenge a project, write a reason for the challenge and lock-up 10 DAI as collateral against the challenge. 
          If the challenge is successful, the 10 DAI deposit will be returned and the challenger will be rewarded with 1 DAI for successfully curating the Everest registry."
          value={challenge.description}
          setValue={setChallengeData}
          text="Challenge"
          icon="challenge.png"
          handleClick={handleChallenge}
          showFilters={true}
          items={userProjects}
          sx={{ mt: '140px' }}
        />
      )}
      <Divider />
      <Grid columns={[1, 1, 2]} gap={3}>
        <Box sx={{ margin: ['auto', 'auto', 0], position: 'relative' }}>
          <Styled.p sx={{ maxWidth: '504px', width: '100%' }}>
            {project.description}
          </Styled.p>
          <Box sx={{ mt: 6 }}>
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
            margin: ['32px auto', '32px auto', 0],
            opacity: pendingVotes ? 0.32 : 1,
          }}
        >
          {project.currentChallenge && !project.currentChallenge.resolved && (
            <Box>
              <Styled.h5 sx={{ color: 'secondary', mb: 4 }}>
                {isCompleted ? (
                  <span>Completed Challenge</span>
                ) : (
                  <span>Active Challenge</span>
                )}
              </Styled.h5>
              <Box>
                <p sx={{ variant: 'text.small' }}>Description</p>
                <Styled.p>{project.currentChallenge.description}</Styled.p>
              </Box>

              <Grid columns={3} gap={3} sx={{ my: 4 }}>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Challenge ends</p>
                  <p sx={{ variant: 'text.huge' }}>
                    {remainingTime(project.currentChallenge.endTime)}
                  </p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Voters</p>
                  <p sx={{ variant: 'text.huge' }}>
                    {project.currentChallenge.votes.length}
                  </p>
                </Box>
                <Box>
                  <p sx={{ variant: 'text.small' }}>Challenged by</p>
                  <Link to={`/project/${project.currentChallenge.owner}`}>
                    {`${project.currentChallenge.owner.slice(
                      0,
                      6,
                    )}-${project.currentChallenge.owner.slice(-6)}`}
                  </Link>
                </Box>
              </Grid>
              {isCompleted ? (
                <Fragment>
                  <Styled.h6>
                    This challenge has ended and the project will be{' '}
                    {project.currentChallenge.votesFor >
                    project.currentChallenge.votesAgainst ? (
                      <span>kept</span>
                    ) : (
                      <span>removed</span>
                    )}
                    . Resolve this challenge to update the registry&apos;s state
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
                      text="Resolve"
                      sx={{ border: '1px solid #4C66FF' }}
                      onClick={handleResolveChallenge}
                    />
                  </Grid>
                </Fragment>
              ) : userProjects.length > 0 ? (
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
                      setValue={projects => handleVoting(projects, '1')}
                      title="Vote on behalf of"
                      subtitle="You can select multiple projects"
                      items={userProjects}
                      variant="project"
                      setOpen={value => {
                        setIsKeepOpen(value)
                      }}
                      styles={{
                        pointerEvents:
                          isRemoveOpen || pendingVotes ? 'none' : 'all',
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
                          cursor: pendingVotes ? 'auto' : 'pointer',
                          '&:hover': {
                            boxShadow: pendingVotes && 'none',
                          },
                        }}
                        icon={isKeepOpen ? `keep-white.png` : `keep.png`}
                      />
                    </MultiSelect>
                    <MultiSelect
                      setValue={projects => handleVoting(projects, '2')}
                      title="Vote on behalf of"
                      subtitle="You can select multiple projects"
                      items={userProjects}
                      variant="project"
                      setOpen={value => {
                        setIsRemoveOpen(value)
                      }}
                      styles={{
                        pointerEvents:
                          isKeepOpen || pendingVotes ? 'none' : 'all',
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
                          cursor: pendingVotes ? 'auto' : 'pointer',
                          '&:hover': {
                            boxShadow: pendingVotes && 'none',
                          },
                        }}
                        icon={isRemoveOpen ? `remove-white.png` : `remove.png`}
                      />
                    </MultiSelect>
                  </Grid>
                </Fragment>
              ) : (
                ''
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
    width: 'auto',
    height: '16px',
  },
}

Project.propTypes = {
  pageContext: PropTypes.any,
  location: PropTypes.any,
}

export default Project
