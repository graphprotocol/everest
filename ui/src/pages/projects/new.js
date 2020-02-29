/** @jsx jsx */
import { useState } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import cloneDeep from 'lodash.clonedeep'
import { navigate } from 'gatsby'

import client from '../../utils/apollo/client'
import { useAccount } from '../../utils/hooks'

import { ADD_PROJECT } from '../../utils/apollo/mutations'
import { ALL_CATEGORIES_QUERY } from '../../utils/apollo/queries'
import { PROJECTS_QUERY } from '../../utils/apollo/queries'

import ProjectForm from '../../components/ProjectForm'

const NewProject = ({ setPendingProject }) => {
  const { account } = useAccount()
  const [isDisabled, setIsDisabled] = useState(true)
  const [project, setProject] = useState({
    name: '',
    description: '',
    avatar: '',
    image: '',
    website: '',
    github: '',
    twitter: '',
    isRepresentative: false,
    categories: [],
  })

  const { data: categories } = useQuery(ALL_CATEGORIES_QUERY)
  const { data: projects } = useQuery(PROJECTS_QUERY)

  const [addProject, { data, loading, error, state }] = useMutation(
    ADD_PROJECT,
    {
      client: client,
      refetchQueries: [
        {
          query: PROJECTS_QUERY,
        },
      ],
      optimisticResponse: {
        __typename: 'Mutation',
        addProject: {
          id: '123',
          ...project,
          __typename: 'Project',
        },
      },
      onError: error => {
        console.error('Error adding a project: ', error)
      },
      onCompleted: mydata => {
        setPendingProject(null)
        window.localStorage.removeItem('pendingProject')
      },
      update: (proxy, result) => {
        const projectData = cloneDeep(
          proxy.readQuery({
            query: PROJECTS_QUERY,
          }),
        )

        // TODO: this doesn't seem to be writing into the cache
        proxy.writeQuery({
          query: PROJECTS_QUERY,
          data: { ...projectData },
          projects: [...projectData.projects, result.data.addProject],
        })
      },
    },
  )

  const setImage = (field, data) => {
    setProject(state => ({
      ...state,
      [field]: data,
    }))
  }

  const setValue = async (field, value) => {
    let newValue = value
    if (field === 'categories') {
      newValue = value.reduce((acc, current) => {
        acc.push(current.id)
        return acc
      }, [])
    }
    await setProject(state => ({
      ...state,
      [field]: newValue,
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

  const handleSubmit = async project => {
    addProject({ variables: { ...project } })
    setPendingProject(project)
    if (typeof window !== undefined) {
      window.localStorage.setItem('pendingProject', JSON.stringify(project))
    }
    navigate(`/profile?id=${account}`)
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
          categories={categories ? categories.categories : []}
        />
      </Box>
    </Grid>
  )
}

export default NewProject
