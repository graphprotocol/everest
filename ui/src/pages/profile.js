/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import ThreeBox from '3box'
import queryString from 'query-string'
import { isMobile } from 'react-device-detect'
import moment from 'moment'

import { useAccount } from '../utils/hooks'
import { metamaskAccountChange } from '../services/ethers'
import { convertDate } from '../utils/helpers'
import { PROFILE_QUERY, USER_CHALLENGES_QUERY } from '../utils/apollo/queries'
import { FILTERS, ORDER_BY, ORDER_DIRECTION } from '../utils/constants'

import Divider from '../components/Divider'
import Button from '../components/Button'
import Section from '../components/Section'
import Switcher from '../components/Switcher'
import Sorting from '../components/Sorting'
import DataRow from '../components/DataRow'
import Menu from '../components/Menu'
import Filters from '../components/Filters'
import Link from '../components/Link'
import ProfilePlaceholder from '../images/profile-placeholder.svg'

const Profile = ({ location }) => {
  const { account } = useAccount()
  const queryParams = location ? queryString.parse(location.search) : null

  const [imagePrefix, setImagePrefix] = useState('')
  const [selectedProjectsView, setSelectedProjectsView] = useState('cards')
  const [selectedChallengesView, setSelectedChallengesView] = useState('cards')
  const [selectedDelegatorView, setSelectedDelegatorView] = useState('cards')
  const [profile, setProfile] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState(
    queryParams && queryParams.view ? queryParams.view : FILTERS.all,
  )
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedOrderBy, setSelectedOrderBy] = useState(ORDER_BY['Name'])
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.ASC,
  )
  const [isSortingOpen, setIsSortingOpen] = useState(false)

  const profileId = queryParams ? queryParams.id : null

  useEffect(() => {
    async function getProfile() {
      const threeBoxProfile = await ThreeBox.getProfile(profileId)
      let image
      if (threeBoxProfile.image && threeBoxProfile.image.length > 0) {
        image = `https://ipfs.infura.io/ipfs/${threeBoxProfile.image[0].contentUrl['/']}`
      } else {
        image = `${window.__GATSBY_IPFS_PATH_PREFIX__ ||
          ''}/profile-default.png`
      }
      const threeBoxAccounts = await ThreeBox.getVerifiedAccounts(
        threeBoxProfile,
      )
      if (threeBoxProfile && Object.keys(threeBoxProfile).length > 0) {
        setProfile(state => ({
          ...state,
          ...threeBoxProfile,
          image: image,
          accounts: threeBoxAccounts,
        }))
      } else {
        setProfile({ image: image })
      }
    }
    getProfile()
  }, [profileId])

  useEffect(() => {
    let walletConnector
    if (typeof window !== undefined) {
      const storage = window.localStorage.getItem('WALLET_CONNECTOR')
      if (storage) {
        walletConnector = JSON.parse(storage)
        if (walletConnector && walletConnector.name === 'injected') {
          metamaskAccountChange(accounts => {
            if (accounts && accounts.length > 0) {
              navigate(`/profile/?id=${accounts[0]}`)
            } else {
              navigate('/')
            }
          })
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  const variables = {
    id: profileId,
    orderBy: selectedOrderBy,
    orderDirection: selectedOrderDirection,
  }

  const { error, data, loading } = useQuery(PROFILE_QUERY, {
    variables:
      selectedFilter === FILTERS.all
        ? variables
        : selectedFilter === FILTERS.challenged
        ? {
            ...variables,
            where: {
              currentChallenge_not: null,
            },
          }
        : {
            ...variables,
            where: {
              isRepresentative: true,
            },
          },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  })

  const { data: userChallenges } = useQuery(USER_CHALLENGES_QUERY, {
    variables: {
      endTime: moment().unix(),
      projects:
        data && data.user
          ? data.user.projects.reduce(
              (acc, current) => acc.concat(current.id),
              [],
            )
          : [],
    },
  })

  if (error) {
    console.error('Error with Profile query: ', error)
    return <div />
  }

  const renderHeaders = () => {
    return (
      <Box>
        <Grid
          sx={{
            gridTemplateColumns: 'max-content 1fr ',
            alignItems: 'center',
          }}
          gap={4}
        >
          {isOwner() ? (
            <Styled.h5
              sx={{
                borderRight: '1px solid',
                borderColor: 'grey',
                pr: 5,
                mb: 2,
              }}
            >
              Your Projects
            </Styled.h5>
          ) : (
            <Styled.h5
              sx={{
                borderRight: '1px solid',
                borderColor: 'grey',
                pr: 5,
                mb: 2,
              }}
            >
              Projects
            </Styled.h5>
          )}
          <Filters
            items={[
              {
                text: isMobile ? 'All' : 'All projects',
                handleSelect: () => {
                  setSelectedFilter(FILTERS.all)
                },
              },
              {
                text: isMobile ? 'Challenged' : 'Challenged projects',
                handleSelect: () => {
                  setSelectedFilter(FILTERS.challenged)
                },
              },
              {
                text: isMobile ? 'Claimed' : 'Claimed projects',
                handleSelect: () => {
                  setSelectedFilter(FILTERS.claimed)
                },
              },
            ]}
            menuStyles={{ left: 0, top: '60px' }}
            width={['initial', '280px', '280px']}
            setIsFilterOpen={setIsFilterOpen}
            isFilterOpen={isFilterOpen}
            selectedFilter={selectedFilter}
          />
        </Grid>
        <Grid columns={['max-content 1fr', '1fr', '1fr']}>
          <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
            {user && user.projects && (
              <span>{user.projects.length} Projects</span>
            )}
          </Styled.p>
          <Sorting
            selectedOrderBy={selectedOrderBy}
            setSelectedOrderBy={setSelectedOrderBy}
            selectedOrderDirection={selectedOrderDirection}
            setSelectedOrderDirection={setSelectedOrderDirection}
            isSortingOpen={isSortingOpen}
            setIsSortingOpen={setIsSortingOpen}
            orderBy={ORDER_BY}
            sx={{ display: ['grid', 'none', 'none'] }}
          />
        </Grid>
      </Box>
    )
  }

  const isOwner = () => account === profileId || account === profileId

  const user = data ? data.user : {}

  return (
    <Box>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: ['1fr', '120px 1fr'],
            alignItems: 'center',
          }}
        >
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
            {profile && profile.image ? (
              <img src={profile.image} alt="Profile" sx={profileImgStyles} />
            ) : (
              <ProfilePlaceholder sx={profileImgStyles} />
            )}
            {isOwner() && isMobile && (
              <Menu
                items={[
                  {
                    text: 'Edit (3Box)',
                    handleSelect: () => {
                      window.open(`https://3box.io/${account}`, '_blank')
                    },
                    icon: `edit.png`,
                  },
                ]}
              >
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
              </Menu>
            )}
          </Grid>
          {profile && profile.name ? (
            <Box>
              <Styled.h2>{profile.name}</Styled.h2>
              <Styled.a
                sx={{
                  fontSize: ['0.85rem', '0.85rem', '1rem'],
                  fontWeight: 'heading',
                  color: 'secondary',
                  mt: 1,
                }}
                href={`https://3box.io/${profileId}`}
                target="_blank"
              >
                {profileId}
              </Styled.a>
            </Box>
          ) : (
            <Box>
              <Styled.h5 sx={{ fontSize: ['0.85rem', '1.25rem', '1.5rem'] }}>
                {profileId}
              </Styled.h5>
              {isOwner() && (
                <Link
                  onClick={() =>
                    window.open(`https://3box.io/${account}`, '_blank')
                  }
                  sx={{ fontWeight: 'heading', color: 'secondary', mt: 3 }}
                >
                  Edit/Create profile (3Box)
                </Link>
              )}
            </Box>
          )}
        </Grid>
        <Grid
          sx={{
            gridTemplateColumns:
              user && user.createdAt
                ? ['1fr 1fr', '1fr max-content']
                : ['max-content'],
            justifyContent: 'flex-end',
            textAlign: ['left', profile ? 'center' : 'right'],
          }}
          mt={[5, 5, 0]}
        >
          {user && user.createdAt && (
            <Box>
              <p sx={{ variant: 'text.small' }}>Member Since</p>
              <p sx={{ variant: 'text.huge' }}>
                {user ? convertDate(user.createdAt) : ''}
              </p>
            </Box>
          )}
          {isOwner() && !isMobile && (
            <Menu
              items={[
                {
                  text: 'Edit (3Box)',
                  handleSelect: () => {
                    window.open(`https://3box.io/${account}`, '_blank')
                  },
                  icon: `edit.png`,
                },
              ]}
            >
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
            </Menu>
          )}
        </Grid>
      </Grid>
      {profile && <Divider />}
      <Grid columns={[1, 1, 2]} gap={5}>
        <Box>
          {profile && profile.description && (
            <Styled.p>{profile.description}</Styled.p>
          )}
        </Box>
        {profile && (
          <Box>
            {profile && profile.website && (
              <DataRow
                name="Website"
                value={profile.website}
                href={profile.website}
              />
            )}
            {profile &&
              profile.accounts &&
              Object.keys(profile.accounts).length > 0 && (
                <Fragment>
                  {profile.accounts && profile.accounts.github && (
                    <DataRow
                      name="Github"
                      value={`${profile.accounts.github.username}`}
                      href={`https://github.com/${profile.accounts.github.username}`}
                    />
                  )}
                  {profile.accounts.twitter && (
                    <DataRow
                      name="Twitter"
                      value={`${profile.accounts.twitter.username}`}
                      href={`https://twitter.com/${profile.accounts.twitter.username}`}
                    />
                  )}
                </Fragment>
              )}
          </Box>
        )}
      </Grid>
      {user && user.projects && user.projects.length > 0 ? (
        <Fragment>
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            {renderHeaders()}
            <Grid
              sx={{
                gridTemplateColumns: '1fr max-content',
                alignItems: 'baseline',
              }}
            >
              <Sorting
                selectedOrderBy={selectedOrderBy}
                setSelectedOrderBy={setSelectedOrderBy}
                selectedOrderDirection={selectedOrderDirection}
                setSelectedOrderDirection={setSelectedOrderDirection}
                isSortingOpen={isSortingOpen}
                setIsSortingOpen={setIsSortingOpen}
                orderBy={ORDER_BY}
                sx={{ display: ['none', 'grid', 'grid'] }}
              />
              <Switcher
                selected={selectedProjectsView}
                setSelected={setSelectedProjectsView}
              />
            </Grid>
          </Grid>
          <Section
            items={user.projects.map(project => {
              return {
                ...project,
                description: project.description
                  ? project.description.slice(0, 30) + '...'
                  : '',
                to: `/project/${project.id}/`,
                image: project.avatar,
                pending: project.id.indexOf('0x') < 0,
                isChallenged: project.currentChallenge !== null,
                categories: project.categories,
              }
            })}
            variant="project"
            selected={selectedProjectsView}
          />
        </Fragment>
      ) : selectedFilter === FILTERS.challenged ||
        selectedFilter === FILTERS.claimed ? (
        <Grid columns={[1, 2, 2]} mb={1} mt={6}>
          {renderHeaders()}
        </Grid>
      ) : (
        !loading && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <img
              src={`${imagePrefix}/mountain-empty.png`}
              sx={{ height: '190px', width: ['100%', 'auto', 'auto'] }}
            />
            <Divider sx={{ mt: '-6px !important' }} />
            {isOwner() ? (
              <Fragment>
                <Styled.h5 sx={{ mt: 7 }}>Your Projects</Styled.h5>
                <Styled.p sx={{ opacity: 0.64, mt: 3 }}>
                  This is where you&apos;ll see projects you created
                </Styled.p>
                <Button
                  text="Add a Project"
                  to="/projects/new/"
                  variant="primary"
                  sx={{ m: '0 auto', mt: 7 }}
                />
              </Fragment>
            ) : (
              <Fragment>
                <Styled.h5 sx={{ mt: 7 }}>Projects</Styled.h5>
                <Styled.p sx={{ opacity: 0.64, mt: 3 }}>
                  This user has no projects
                </Styled.p>
              </Fragment>
            )}
          </Box>
        )
      )}

      {user && user.delegatorProjects && user.delegatorProjects.length > 0 && (
        <Fragment>
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            <Box>
              {isOwner() ? (
                <Styled.h5>Projects Delegated to You</Styled.h5>
              ) : (
                <Styled.h5>Projects Delegated to Them</Styled.h5>
              )}
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                <span>{user.delegatorProjects.length} Delegated Projects</span>
              </Styled.p>
            </Box>
            <Switcher
              selected={selectedDelegatorView}
              setSelected={setSelectedDelegatorView}
            />
          </Grid>
          <Section
            items={user.delegatorProjects.map(project => {
              return {
                ...project,
                description: project.description.slice(0, 30) + '...',
                to: `/project/${project.id}/`,
                image: project.avatar,
                pending: project.id.indexOf('0x') < 0,
                isChallenged: project.currentChallenge !== null,
                categories: project.categories,
              }
            })}
            variant="project"
            selected={selectedDelegatorView}
          />
        </Fragment>
      )}

      {userChallenges && userChallenges.length > 0 && (
        <Fragment>
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            <Box>
              {isOwner() ? (
                <Styled.h5>Projects You're Challenging</Styled.h5>
              ) : (
                <Styled.h5>Projects They're Challenging</Styled.h5>
              )}
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                <span>
                  {userChallenges ? userChallenges.challenges.length : ''}{' '}
                  Challenged Projects
                </span>
              </Styled.p>
            </Box>
            <Switcher
              selected={selectedChallengesView}
              setSelected={setSelectedChallengesView}
            />
          </Grid>
          <Section
            items={
              userChallenges
                ? userChallenges.challenges.map(challenge => {
                    const project = challenge.project
                    return {
                      ...project,
                      description: project.description.slice(0, 30) + '...',
                      to: `/project/${project.id}/`,
                      image: project.avatar,
                      pending: project.id.indexOf('0x') < 0,
                      isChallenged: project.currentChallenge !== null,
                      categories: project.categories,
                    }
                  })
                : []
            }
            variant="project"
            selected={selectedChallengesView}
          />
        </Fragment>
      )}
    </Box>
  )
}

const profileImgStyles = {
  height: '96px',
  width: '96px',
  borderRadius: '50%',
  objectFit: 'contain',
}

Profile.propTypes = {
  location: PropTypes.any,
}

export default Profile
