/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { useWeb3React } from '@web3-react/core'
import ThreeBox from '3box'

import { metamaskAccountChange } from '../services/ethers'
import { convertDate } from '../utils/helpers/date'
import { PROFILE_QUERY } from '../utils/apollo/queries'

import Divider from '../components/Divider'
import Button from '../components/Button'
import Section from '../components/Section'
import Switcher from '../components/Switcher'
import DataRow from '../components/DataRow'
import Menu from '../components/Menu'
import Modal from '../components/Modal'
import ProfileImage from '../images/profile-placeholder.svg'

const Profile = ({ location }) => {
  const [selectedProjects, setSelectedProjects] = useState('cards')
  const [selectedChallenges, setSelectedChallenges] = useState('cards')
  const [profile, setProfile] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const { account } = useWeb3React()

  const profileId = location ? location.pathname.split('/').slice(-1)[0] : ''

  useEffect(() => {
    async function getProfile() {
      const threeBoxProfile = await ThreeBox.getProfile(profileId)

      const threeBoxAccounts = await ThreeBox.getVerifiedAccounts(
        threeBoxProfile,
      )

      if (threeBoxProfile && Object.keys(threeBoxProfile).length > 0) {
        setProfile(state => ({
          ...state,
          ...threeBoxProfile,
          accounts: threeBoxAccounts,
        }))
      }
    }
    metamaskAccountChange(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    })
    getProfile()
  }, [])

  // const handleClick = (e, to) => {
  //   e.preventDefault()
  //   if (typeof window !== 'undefined') {
  //     window.open(to, '_blank')
  //   }
  // }

  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: {
      id: profileId,
    },
  })

  if (loading) {
    return <Styled.p>Loading</Styled.p>
  }

  if (error) {
    console.error('Error with Profile query: ', error)
    return <div />
  }

  const user = data && data.user

  return (
    <Grid>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: [1, '120px 1fr'],
            alignItems: 'center',
          }}
        >
          <Box>
            <ProfileImage
              sx={{ height: '96px', width: '96px', borderRadius: '50%' }}
            />
          </Box>
          {profile ? (
            <Box>
              <Styled.h2>{profile.name}</Styled.h2>
              <p
                sx={{
                  fontSize: ['0.85rem', '0.85rem', '1rem'],
                  fontWeight: 'heading',
                  color: 'secondary',
                  mt: 1,
                }}
              >
                {profileId}
              </p>
            </Box>
          ) : (
            <Box>
              <Styled.h5>{profileId}</Styled.h5>
              <Styled.p
                sx={{ fontWeight: 'heading', color: 'secondary', mt: 3 }}
              >
                Edit/Create profile (3Box)
              </Styled.p>
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
          <Menu
            items={[
              {
                text: 'Edit',
                handleSelect: () => {
                  window.open(`https://3box.io/${account}`, '_blank')
                },
                icon: '/challenge.png',
              },
              {
                text: (
                  <Fragment>
                    <Box
                      onClick={e => {
                        e.preventDefault()
                        openModal()
                      }}
                    >
                      Change wallet
                    </Box>
                    {showModal && (
                      <Modal
                        showModal={showModal}
                        closeModal={closeModal}
                      ></Modal>
                    )}
                  </Fragment>
                ),
                icon: '/share.png',
              },
            ]}
          >
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
              onClick={() => closeModal()}
            />
          </Menu>
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
            {profile && Object.keys(profile.accounts).length > 0 && (
              <Fragment>
                {profile.accounts.twitter && (
                  <DataRow
                    name="Twitter"
                    value={`twitter.com/${profile.accounts.twitter.username}`}
                    href={`https://twitter.com/${profile.accounts.twitter.username}`}
                  />
                )}
                {profile.accounts.github && (
                  <DataRow
                    name="Github"
                    value={`github.com/${profile.accounts.github.username}`}
                    href={`https://github.com/${profile.accounts.github.username}`}
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
            <Box>
              <Styled.h5>Your Projects</Styled.h5>
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                {user && user.projects && user.projects.length > 0 && (
                  <span>{user.projects.length} Projects</span>
                )}
              </Styled.p>
            </Box>
            {user && user.projects && user.projects.length > 0 && (
              <Switcher
                selected={selectedProjects}
                setSelected={setSelectedProjects}
              />
            )}
          </Grid>
          {user && user.projects.length > 0 && (
            <Section
              items={user.projects.map(project => {
                return {
                  ...project,
                  description: project.description.slice(0, 30) + '...',
                  to: `/project/${project.id}`,
                  image: project.avatar,
                }
              })}
              variant="project"
              selected={selectedProjects}
            />
          )}
          {/* TODO: Replace with challenges  */}
          <Grid columns={[1, 2, 2]} mb={1} mt={6}>
            <Box>
              <Styled.h5>Your Challenges</Styled.h5>
              <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
                {user && user.projects && (
                  <span>{user.projects.length} Projects - </span>
                )}
                {user && user.projects && (
                  <span>{user.projects.length} Initiated</span>
                )}
              </Styled.p>
            </Box>
            {user && user.projects.length > 0 && (
              <Switcher
                selected={selectedChallenges}
                setSelected={setSelectedChallenges}
              />
            )}
          </Grid>
          {user && user.projects.length > 0 && (
            <Section
              items={user.projects.map(project => {
                return {
                  ...project,
                  description: project.description.slice(0, 30) + '...',
                  to: `/project/${project.id}`,
                  image: project.avatar,
                }
              })}
              variant="project"
              selected={selectedChallenges}
            />
          )}
        </Fragment>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <img
            src={`${window.__GATSBY_IPFS_PATH_PREFIX__ ||
              ''}/mountain-empty.png`}
            sx={{ height: '190px', width: 'auto' }}
          />
          <Divider sx={{ mt: '-6px !important' }} />
          <Styled.h5 sx={{ mt: 7 }}>Your Projects</Styled.h5>
          <Styled.p sx={{ opacity: 0.64, mt: 3 }}>
            This is where you&apos;ll see projects you created
          </Styled.p>
          <Button
            text="Add a Project"
            to="/projects/new"
            variant="primary"
            sx={{ m: '0 auto', mt: 7 }}
          />
        </Box>
      )}
    </Grid>
  )
}

Profile.propTypes = {
  pageContext: PropTypes.any,
  location: PropTypes.any,
}

export default Profile
