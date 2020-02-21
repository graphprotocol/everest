/** @jsx jsx */
import { useState } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { gql } from 'apollo-boost'

import ProjectForm from '../../components/ProjectForm'

export const ADD_PROJECT = gql`
  mutation addProject(
    $name: String!
    $description: String!
    $avatar: String
    $image: String
    $website: String
    $github: String
    $twitter: String
    $isRepresentative: Boolean
    $categories: any
  ) {
    addProject(
      name: $name
      description: $description
      avatar: $avatar
      image: $image
      website: $website
      github: $github
      twitter: $twitter
      isRepresentative: $isRepresentative
      categories: $categories
    ) @client
  }
`

const NewProject = () => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [project, setProject] = useState({
    name: '',
    description: '',
    avatar: '',
    image: '',
    website: '',
    github: '',
    twitter: '',
    isRepresentative: null,
    categories: [],
  })

  const [addProject, { data, loading, error, state }] = useMutation(
    ADD_PROJECT,
    {
      onError: error => {
        console.error('Error adding a project: ', error)
      },
      onCompleted: mydata => {
        if (data) {
          console.log('COMPLETED: ', mydata)
        }
      },
    },
  )

  const setImage = (field, data) => {
    setProject(state => ({
      ...state,
      [field]: data,
    }))
  }

  const handleSubmit = async project => {
    addProject({ variables: { ...project } })
  }

  const setValue = async (field, value) => {
    await setProject(state => ({
      ...state,
      [field]: value,
    }))
  }

  const setDisabled = value => {
    if (typeof value === 'string') {
      setIsDisabled(
        !(
          value.length > 0 &&
          project.categories &&
          project.categories.length > 0
        ),
      )
    } else {
      setIsDisabled(
        !(
          value.length > 0 &&
          project.description !== '' &&
          project.name !== ''
        ),
      )
    }
  }

  return (
    <Grid
      sx={{
        gridTemplateColumns: ['1fr', '312px 1fr'],
        position: 'relative',
        pt: 8,
      }}
      gap={[1, 4, 8]}
    >
      <Box>
        <Styled.h1 sx={{ color: 'white', mb: 3 }}>Add Project</Styled.h1>
        <p sx={{ variant: 'text.field' }}>
          Add a project to the Everest registry, a universally shared list of
          projects in Web3. <br />
          <br />
          A project can be a dApp, DAO, protocol, NGO, research group service
          provider and more! <br />
          <br />
          Make sure to tag your project&apos;s categories to allow other users
          to search for your project.
        </p>
        <p sx={{ variant: 'text.field', mt: 5 }}>Listing fee</p>
        <p sx={{ variant: 'text.huge', color: 'white' }}>10 DAI</p>
      </Box>
      <Box>
        <ProjectForm
          project={project}
          isDisabled={isDisabled}
          handleSubmit={handleSubmit}
          setValue={setValue}
          setDisabled={setDisabled}
          buttonText="Add project"
          setImage={setImage}
        />
      </Box>
    </Grid>
  )
}

export default NewProject
