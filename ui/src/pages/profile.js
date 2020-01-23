/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import ThreeBox from '3box'

import { getAddress, metamaskAccountChange } from '../services/ethers'
import { convertDate } from '../utils/helpers/date'

import Layout from '../components/Layout'
import Divider from '../components/Divider'
import Button from '../components/Button'
import Section from '../components/Section'
import Switcher from '../components/Switcher'
import DataRow from '../components/DataRow'
import ProfileImage from '../images/profile-placeholder.svg'

const PROFILE_QUERY = gql`
  query everestProfile($id: ID!) {
    user(where: { id: $id }) {
      id
      createdAt
      projects {
        id
        name
        description
        categories
        avatar
        createdAt
        reputation
        isChallenged
      }
      challenges {
        id
      }
    }
  }
`

const Profile = ({ location }) => {
  const [selectedProjects, setSelectedProjects] = useState('cards')
  const [selectedChallenges, setSelectedChallenges] = useState('cards')
  const [profile, setProfile] = useState(null)
  const [address, setAddress] = useState(null)

  useEffect(() => {
    async function getProfile() {
      const address = await getAddress()
      setAddress(address)
      const threeBoxProfile = await ThreeBox.getProfile(address)

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

  const handleClick = (e, to) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      window.open(to, '_blank')
    }
  }

  const profileId = location ? location.pathname.split('/').slice(-1)[0] : ''

  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: {
      id: profileId,
    },
  })

  if (loading && !error) {
    return (
      <Layout>
        <Styled.p>Loading</Styled.p>
      </Layout>
    )
  }

  const user = data.user

  return (
    <Layout>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid
          sx={{
            gridTemplateColumns: [1, '120px 1fr'],
            alignItems: 'center',
          }}
        >
          <Box>{false ? '' : <ProfileImage sx={projectLogoStyle} />}</Box>
          <Box sx={{ color: 'secondary', fontWeight: 'heading' }}>
            <Styled.h2>{profile ? profile.name : ''}</Styled.h2>
            <p sx={{ fontSize: ['0.85rem', '0.85rem', '1rem'] }}>{profileId}</p>
          </Box>
        </Grid>
        <Grid
          sx={{
            gridTemplateColumns: ['1fr 1fr', '1fr max-content'],
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
          {profile && (
            <Button
              variant="primary"
              text="Edit profile"
              sx={{ maxWidth: '194px' }}
              onClick={e => {
                handleClick(e, `https://3box.io/${address}`)
              }}
            />
          )}
        </Grid>
      </Grid>
      <Divider />
      <Grid columns={[1, 1, 2]} gap={5}>
        <Box>
          {profile && profile.description ? (
            <Styled.p>{profile.description}</Styled.p>
          ) : (
            <Styled.p>Create a profile on 3Box - PLACEHOLDER</Styled.p>
          )}
        </Box>
        {profile ? (
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
        ) : (
          <Box sx={{ justifySelf: 'flex-end' }}>
            <Button
              variant="primary"
              text="Create profile"
              sx={{ maxWidth: '194px' }}
              onClick={e => {
                handleClick(e, `https://3box.io/hub`)
              }}
            />
          </Box>
        )}
      </Grid>
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
    </Layout>
  )
}

const projectLogoStyle = { height: '96px', width: '96px', borderRadius: '50%' }

export default Profile
