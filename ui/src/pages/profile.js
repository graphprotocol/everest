/** @jsx jsx */
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Layout from '../components/Layout'
import Divider from '../components/Divider'
import Button from '../components/Button'
import ProfileImage from '../images/profile-placeholder.svg'

const Profile = ({ location }) => {
  const profileId = location ? location.pathname.split('/').slice(-1)[0] : ''
  return (
    <Layout>
      <Grid columns={[1, 1, 2]} gap={0} sx={{ alignItems: 'center' }}>
        <Grid sx={{ gridTemplateColumns: [1, '120px 1fr'] }}>
          <Box>{false ? '' : <ProfileImage sx={projectLogoStyle} />}</Box>
          <Box sx={{ color: 'secondary', fontWeight: 'heading' }}>
            <Styled.h2>Name</Styled.h2>
            <p sx={{ fontSize: ['0.85rem', '0.85rem', '1rem'] }}>{profileId}</p>
          </Box>
        </Grid>
        <Grid
          sx={{
            gridTemplateColumns: ['1fr 1fr', '1fr max-content'],
            textAlign: ['left', 'center']
          }}
          mt={[5, 5, 0]}
        >
          <Box>
            <p sx={{ variant: 'text.displaySmall' }}>Member Since</p>
            <p sx={{ variant: 'text.displayBig' }}>No data</p>
          </Box>
          <Button
            variant="primary"
            text="Edit profile"
            sx={{ maxWidth: '194px' }}
            onClick={() => console.log('edit profile')}
          />
        </Grid>
      </Grid>
      <Divider />
      <Grid columns={[1, 1, 2]} gap={3}>
        <Box>
          <Styled.p>PLACEHOLDER</Styled.p>
        </Box>
      </Grid>
    </Layout>
  )
}

const projectLogoStyle = { height: '96px', width: '96px', borderRadius: '50%' }

export default Profile
