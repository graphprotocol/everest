/** @jsx jsx */
import { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import ThreeBox from '3box'
import client from '../utils/apollo/client'
import cloneDeep from 'lodash.clonedeep'
import moment from 'moment'
import { isMobile } from 'react-device-detect'

import { convertDate } from '../utils/helpers/date'
import { defaultImage } from '../utils/helpers/utils'
import { useAccount } from '../utils/hooks'
import { remainingTime } from '../utils/helpers/date'
import { metamaskAccountChange } from '../services/ethers'

import {
  PROJECT_QUERY,
  USER_PROJECTS_QUERY,
  PROFILE_QUERY,
} from '../utils/apollo/queries'
import {
  REMOVE_PROJECT,
  RESOLVE_CHALLENGE,
  CHALLENGE_PROJECT,
  VOTE_CHALLENGE,
  TRANSFER_OWNERSHIP,
  DELEGATE_OWNERSHIP,
} from '../utils/apollo/mutations'

import Divider from '../components/Divider'
import DataRow from '../components/DataRow'
import Button from '../components/Button'
import TabView from '../components/TabView'
import Link from '../components/Link'
import Menu from '../components/Menu'
import MultiSelect from '../components/Select/MultiSelect'

import Close from '../images/close.svg'
import { navigate } from 'gatsby'

const Project = ({ location }) => {
  const { account } = useAccount()

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
  const [pendingResolve, setPendingResolve] = useState(false)
  const [challengeResolved, setChallengeResolved] = useState(false)
  const index = location ? location.pathname.indexOf('0x') : null
  const projectId =
    location && index ? location.pathname.slice(index, index + 42) : ''

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const { data: userData } = useQuery(USER_PROJECTS_QUERY, {
    variables: {
      id: account,
    },
  })

  const { data: profile } = useQuery(PROFILE_QUERY, {
    variables: {
      id: account,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    },
  })

  let userProjects = userData && userData.user ? userData.user.projects : []

  const [removeProject] = useMutation(REMOVE_PROJECT, {
    client: client,
    refetchQueries: [
      {
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
      },
    ],
    optimisticResponse: {
      __typename: 'Mutation',
      removeProject: true,
    },
    onError: error => {
      console.error('Error adding a project: ', error)
    },
    update: proxy => {
      const profileData = cloneDeep(
        proxy.readQuery({
          query: PROFILE_QUERY,
          variables: {
            id: account,
            orderBy: 'createdAt',
            orderDirection: 'desc',
          },
        }),
      )

      const remainingProjects = profileData.user.projects.filter(
        project => project.id !== projectId,
      )

      proxy.writeQuery({
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
        data: {
          user: {
            id: account,
            __typename: 'User',
            delegatorProjects:
              profile && profile.user && profile.user.delegatorProjects,
            projects: remainingProjects,
          },
        },
      })
    },
  })

  const [resolveChallenge] = useMutation(RESOLVE_CHALLENGE, {
    onError: error => {
      console.error('Error voting on a challenge: ', error)
      setPendingResolve(false)
    },
    onCompleted: () => {
      setChallengeResolved(true)
    },
  })

  const [challengeProject] = useMutation(CHALLENGE_PROJECT, {
    client: client,
    refetchQueries: [
      {
        query: PROJECT_QUERY,
        variables: {
          id: data && data.project ? data.project.id : '',
        },
      },
    ],
    optimisticResponse: {
      __typename: 'Mutation',
      challengeProject: {
        id: data && data.project ? data.project.id : '',
        name: data && data.project ? data.project.name : '',
        description: data && data.project ? data.project.description : '',
        avatar: data && data.project ? data.project.avatar : '',
        image: data && data.project ? data.project.image : '',
        website: data && data.project ? data.project.website : '',
        github: data && data.project ? data.project.github : '',
        twitter: data && data.project ? data.project.twitter : '',
        isRepresentative:
          data && data.project ? data.project.isRepresentative : false,
        createdAt: data && data.project ? data.project.createdAt : [],
        totalVotes: data && data.project ? data.project.totalVotes : '',
        currentChallenge: {
          __typename: 'Challenge',
          id: '123',
          endTime: moment()
            .add(4, 'days')
            .unix(),
          owner: account,
          description: challenge.description,
          resolved: false,
          votesFor: 0,
          votesAgainst: 0,
          votes: [],
        },
        owner: {
          id: data && data.project ? data.project.owner.id : '',
        },
        categories: data && data.project ? data.project.categories : [],
        __typename: 'Project',
      },
    },
    onError: error => {
      console.error('Error challenging project: ', error)
    },
    update: (proxy, result) => {
      const projectData = cloneDeep(
        proxy.readQuery({
          query: PROJECT_QUERY,
          variables: {
            id: data && data.project ? data.project.id : '',
          },
        }),
      )

      proxy.writeQuery({
        query: PROJECT_QUERY,
        variables: {
          id: data && data.project ? data.project.id : '',
        },
        data: {
          project: {
            ...projectData.project,
            currentChallenge: result.data.challengeProject.currentChallenge,
          },
        },
      })
    },
  })

  const [voteChallenge] = useMutation(VOTE_CHALLENGE, {
    client: client,
    onError: error => {
      console.error('Error voting on a challenge: ', error)
    },
    onCompleted: () => {
      setPendingVotes(false)
    },
  })

  const [transferOwnership] = useMutation(TRANSFER_OWNERSHIP, {
    client: client,
    refetchQueries: [
      {
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
      },
    ],
    optimisticResponse: {
      __typename: 'Mutation',
      transferOwnership: {
        id: '123',
        name: data && data.project ? data.project.name : '',
        description: data && data.project ? data.project.description : '',
        avatar: data && data.project ? data.project.avatar : '',
        image: data && data.project ? data.project.image : '',
        website: data && data.project ? data.project.website : '',
        github: data && data.project ? data.project.github : '',
        twitter: data && data.project ? data.project.twitter : '',
        isRepresentative:
          data && data.project ? data.project.isRepresentative : false,
        createdAt: data && data.project ? data.project.createdAt : [],
        currentChallenge:
          data && data.project ? data.project.currentChallenge : [],
        categories: data && data.project ? data.project.categories : [],
        __typename: 'Project',
      },
    },
    onError: error => {
      console.error('Error transferring ownership: ', error)
    },
    update: proxy => {
      const profileData = cloneDeep(
        proxy.readQuery({
          query: PROFILE_QUERY,
          variables: {
            id: account,
            orderBy: 'createdAt',
            orderDirection: 'desc',
          },
        }),
      )

      const remainingProjects = profileData.user.projects.filter(
        project => project.id !== projectId,
      )
      proxy.writeQuery({
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
        data: {
          user: {
            id: account,
            __typename: 'User',
            delegatorProjects:
              profile && profile.user && profile.user.delegatorProjects,
            projects: remainingProjects,
          },
        },
      })
    },
  })

  const [delegateOwnership] = useMutation(DELEGATE_OWNERSHIP, {
    client: client,
    refetchQueries: [
      {
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
      },
    ],
    optimisticResponse: {
      __typename: 'Mutation',
      delegateOwnership: {
        id: '123',
        name: data && data.project ? data.project.name : '',
        description: data && data.project ? data.project.description : '',
        avatar: data && data.project ? data.project.avatar : '',
        image: data && data.project ? data.project.image : '',
        website: data && data.project ? data.project.website : '',
        github: data && data.project ? data.project.github : '',
        twitter: data && data.project ? data.project.twitter : '',
        isRepresentative:
          data && data.project ? data.project.isRepresentative : false,
        createdAt: data && data.project ? data.project.createdAt : [],
        currentChallenge:
          data && data.project ? data.project.currentChallenge : [],
        categories: data && data.project ? data.project.categories : [],
        delegates: data && data.projoect ? data.project.delegates : [],
        __typename: 'Project',
      },
    },
    onError: error => {
      console.error('Error delegating ownership: ', error)
    },
    update: (proxy, result) => {
      const profileData = cloneDeep(
        proxy.readQuery({
          query: PROFILE_QUERY,
          variables: {
            id: account,
            orderBy: 'createdAt',
            orderDirection: 'desc',
          },
        }),
      )

      proxy.writeQuery({
        query: PROFILE_QUERY,
        variables: {
          id: account,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        },
        data: {
          user: {
            id: account,
            __typename: 'User',
            delegatorProjects:
              profile && profile.user && profile.user.delegatorProjects,
            projects: [
              ...profileData.user.projects,
              result.data.delegateOwnership,
            ],
          },
        },
      })
    },
  })

  useEffect(() => {
    metamaskAccountChange(() => window.location.reload())
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
  let hideVoting
  if (project && project.currentChallenge) {
    let votes = []
    votes = project.currentChallenge.votes.map(vote => vote.id.slice(2))
    userProjects = userProjects.map(up => ({
      ...up,
      disabled:
        up.id === project.id ||
        votes.includes(up.id) ||
        project.currentChallenge.owner === up.id,
    }))
    hideVoting =
      userProjects.length === 1 &&
      userProjects[0].id === project.currentChallenge.owner
  }

  const handleChallenge = () => {
    challengeProject({
      variables: {
        challengingProjectAddress: challenge.projectId,
        challengedProjectAddress: projectId,
        description: challenge.description,
      },
    })
    setShowChallenge(false)
    // window.location.reload()
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

  const handleTransfer = async () => {
    transferOwnership({
      variables: {
        projectId: projectId,
        newOwnerAddress: transferAddress,
      },
    })
    navigate(`/profile?id=${account}`)
  }

  const handleDelegate = async () => {
    delegateOwnership({
      variables: {
        projectId: projectId,
        delegateAddress: delegateAddress,
      },
    })
    navigate(`/profile?id=${account}`)
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
    setPendingResolve(true)
  }

  let tweet = ''
  if (project) {
    tweet = `We’d like to claim the ${project.name} project on @everest_tcr. Please transfer ownership to ${account} 🙌
  everest.link/projects/${project.id}`
  }

  let items = []

  if (account && project && project.owner && account === project.owner.id) {
    items = items.concat([
      {
        text: 'Transfer',
        handleSelect: () => {
          setShowTransfer(true)
          if (!showTransfer) {
            setShowDelegate(false)
            setShowChallenge(false)
          }
        },
        icon: '/ownership.png',
      },
      {
        text: 'Delegate',
        handleSelect: () => {
          setShowDelegate(true)
          if (!showDelegate) {
            setShowTransfer(false)
            setShowChallenge(false)
          }
        },
        icon: '/delegate.png',
      },
    ])
    if (project.currentChallenge) {
      items = items.concat([
        {
          text: 'Edit',
          handleSelect: () => {
            navigate(`/projects/edit?id=${projectId}`)
          },
          icon: '/edit.png',
        },
      ])
    } else {
      items = items.concat([
        {
          text: 'Edit',
          handleSelect: () => {
            navigate(`/projects/edit?id=${projectId}`)
          },
          icon: '/edit.png',
        },
        {
          text: 'Remove',
          handleSelect: () => {
            removeProject({ variables: { projectId } })
            navigate(`/profile?id=${account}`)
          },
          icon: '/trash.png',
        },
      ])
    }
  } else if (userProjects.length > 0 && project && !project.currentChallenge) {
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
  } else {
    items = items.concat([
      {
        text: 'Request ownership',
        handleSelect: () => {
          window.open(
            `https://twitter.com/intent/tweet?text=${tweet} @graphprotocol 
        ${window.location.href}`,
            '_blank',
          )
        },
        icon: '/share.png',
      },
    ])
  }

  const isCompleted =
    project &&
    project.currentChallenge &&
    remainingTime(project.currentChallenge.endTime) === '0d 0h 0m'

  return (
    <Grid sx={{ pb: project && project.currentChallenge ? '400px' : 0 }}>
      <Grid
        columns={[1, 1, 2]}
        gap={0}
        sx={{ alignItems: 'center' }}
        id="click"
      >
        <Grid sx={{ gridTemplateColumns: ['1fr', '120px 1fr'] }}>
          <Box>
            {project.avatar ? (
              <img
                src={`${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${project &&
                  project.avatar}`}
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
          <Grid
            sx={
              isMobile
                ? {
                    gridTemplateColumns: 'max-content max-content',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }
                : {}
            }
          >
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
              <Styled.h2>
                {project.name}{' '}
                {project.isRepresentative && (
                  <img src="/verified.png" sx={{ width: '24px', ml: -3 }} />
                )}
              </Styled.h2>
            </Box>
            {account && isMobile && (
              <Menu items={items} sx={{ justifySelf: 'end' }}>
                {showChallenge || showTransfer || showDelegate ? (
                  <Box
                    sx={{
                      p: [4, 5, 5],
                      borderRadius: '50%',
                      backgroundColor: 'secondary',
                      cursor: 'pointer',
                    }}
                  >
                    <Close
                      onClick={async () => {
                        await setShowChallenge(false)
                        await setShowTransfer(false)
                        const $el = document.querySelector('#click  ')
                        if ($el) {
                          $el.click()
                        }
                      }}
                      sx={{
                        fill: 'white',
                        width: ['18px', '22px', '22px'],
                        height: 'auto',
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
        <Grid
          mt={[5, 5, 0]}
          sx={{
            alignItems: 'center',
            gridTemplateColumns: '200px max-content 1fr',
          }}
          gap={0}
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
                sx={{
                  color: 'secondary',
                  fontSize: ['1rem', '1.5rem', '1.5rem'],
                }}
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
          {account && !isMobile && (
            <Menu items={items} sx={{ justifySelf: 'end' }}>
              {showChallenge || showTransfer || showDelegate ? (
                <Box
                  sx={{
                    p: [4, 5, 5],
                    mt: ['-120px', 0, 0],
                    borderRadius: '50%',
                    backgroundColor: 'secondary',
                    cursor: 'pointer',
                  }}
                >
                  <Close
                    onClick={async () => {
                      await setShowChallenge(false)
                      await setShowTransfer(false)
                      await setShowDelegate(false)
                      const $el = document.querySelector('#click  ')
                      if ($el) {
                        $el.click()
                      }
                    }}
                    sx={{
                      fill: 'white',
                      width: ['18px', '22px', '22px'],
                      height: 'auto',
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
          title="Description"
          placeholder="Challenge Description"
          heading={`Challenge ${project.name}`}
          description={
            <span>
              Challenge a project on the Everest registry if there is incorrect
              information or the project should be removed. Refer to the Charter
              as a guide about Everest&apos;s principles. <br />
              <br /> To challenge a project, write a reason for the challenge
              and lock-up 10 DAI as collateral against the challenge. <br />
              <br /> If the challenge is successful, the 10 DAI deposit will be
              returned and the challenger will be rewarded with 1 DAI for
              successfully curating the Everest registry.
            </span>
          }
          value={challenge.description}
          setValue={setChallengeData}
          text="Challenge"
          icon="challenge.png"
          handleClick={handleChallenge}
          showFilters={true}
          items={userProjects}
          sx={{ mt: ['220px', '140px', '140px'] }}
        />
      )}
      {showTransfer && (
        <TabView
          fieldType="input"
          charsCount={42}
          header="Everest user"
          placeholder="Enter address 0x..."
          heading={`Transfer ${project.name}`}
          description={
            <span>
              You are currently the owner of a project on the Everest registry.
              If you&apos;d like to transfer ownership to another user, please
              select an existing Everest user or enter a new Ethereum address.
              <br />
              <br /> The new owner will be able to edit project details,
              challenge and vote on behalf of the project and delegate voting to
              other users.
            </span>
          }
          value={transferAddress}
          setValue={setTransferAddress}
          error={
            transferAddress.length === 0
              ? ''
              : (transferAddress.indexOf('0x') === 0 &&
                  transferAddress.length !== 42) ||
                transferAddress.indexOf('0x') !== 0
              ? 'This is not a valid address'
              : ''
          }
          text="Transfer"
          icon="transfer-icon.svg"
          handleClick={handleTransfer}
          sx={{ mt: ['220px', '140px', '140px'] }}
        />
      )}
      {showDelegate && (
        <TabView
          fieldType="input"
          charsCount={42}
          title="Ethereum address"
          placeholder="Enter address 0x..."
          heading={`Delegate ${project.name}`}
          description={
            <span>
              You are currently the owner of a project on the Everest registry.
              If you&apos;d like to delegate voting on behalf of your project to
              another user, please select an existing Everest user or enter a
              new Ethereum address. <br />
              <br /> The new delegate will be able to challenge and vote on
              projects, but they will not be able to edit project details or
              delegate voting to other users.
            </span>
          }
          value={delegateAddress}
          setValue={setDelegateAddress}
          error={
            delegateAddress.length === 0
              ? ''
              : (delegateAddress.indexOf('0x') === 0 &&
                  delegateAddress.length !== 42) ||
                delegateAddress.indexOf('0x') !== 0
              ? 'This is not a valid address'
              : ''
          }
          text="Delegate"
          icon="delegate-icon.svg"
          handleClick={handleDelegate}
          sx={{ mt: ['220px', '140px', '140px'] }}
        />
      )}
      <Divider />
      <Grid columns={[1, 1, 2]} gap={3}>
        <Box sx={{ margin: [0, 'auto', 0], position: 'relative' }}>
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
          {project.currentChallenge &&
            !project.currentChallenge.resolved &&
            !challengeResolved && (
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    opacity:
                      project.currentChallenge.id === '123' || pendingResolve
                        ? 0.22
                        : 1,
                    pointerEvents:
                      project.currentChallenge.id === '123' || pendingResolve
                        ? 'none'
                        : 'all',
                  }}
                >
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
                  {isCompleted && !challengeResolved ? (
                    <Fragment>
                      <Styled.h6>
                        This challenge has ended and the project will be{' '}
                        {project.currentChallenge.votesFor >
                        project.currentChallenge.votesAgainst ? (
                          <span>kept</span>
                        ) : (
                          <span>removed</span>
                        )}
                        . Resolve this challenge to update the registry&apos;s
                        state and earn a reward.
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
                          sx={{
                            border: '1px solid #4C66FF',
                            cursor: pendingResolve ? 'auto' : 'pointer',
                            '&:hover': {
                              boxShadow: pendingResolve && 'none',
                            },
                          }}
                          onClick={handleResolveChallenge}
                        />
                      </Grid>
                    </Fragment>
                  ) : userProjects.length > 0 &&
                    project.currentChallenge.id !== '123' &&
                    !hideVoting ? (
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
                              backgroundColor: isKeepOpen
                                ? 'secondary'
                                : 'white',
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
                              backgroundColor: isRemoveOpen
                                ? 'secondary'
                                : 'white',
                              color: isRemoveOpen ? 'white' : 'secondary',
                              opacity: isKeepOpen ? 0.48 : 1,
                              cursor: pendingVotes ? 'auto' : 'pointer',
                              '&:hover': {
                                boxShadow: pendingVotes && 'none',
                              },
                            }}
                            icon={
                              isRemoveOpen ? `remove-white.png` : `remove.png`
                            }
                          />
                        </MultiSelect>
                      </Grid>
                    </Fragment>
                  ) : (
                    ''
                  )}
                </Box>
                {(project.currentChallenge.id === '123' || pendingResolve) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <Styled.h6
                      sx={{ color: 'secondary', fontWeight: 'heading' }}
                    >
                      Waiting for transaction to confirm{' '}
                    </Styled.h6>
                    <img src="/loading-dots-blue.gif" />
                  </Box>
                )}
              </Box>
            )}
          {project.image && (
            <Box
              sx={{
                ...imageStyles,
                backgroundImage: `url(${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${project.image})`,
                margin: ['auto', 'auto', 0],
              }}
            ></Box>
          )}
        </Box>
      </Grid>
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
