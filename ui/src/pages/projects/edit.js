/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import cloneDeep from 'lodash.clonedeep'
import { navigate } from 'gatsby'

import client from '../../utils/apollo/client'

import { EDIT_PROJECT } from '../../utils/apollo/mutations'
import { PROJECT_QUERY } from '../../utils/apollo/queries'
import { ALL_CATEGORIES_QUERY } from '../../utils/apollo/queries'

import ProjectForm from '../../components/ProjectForm'

const EditProject = ({ location }) => {
  const projectId = location ? location.pathname.split('/')[2] : ''
  const [isDisabled, setIsDisabled] = useState(false)
  const [project, setProject] = useState({
    id: projectId,
    name: '',
    description: '',
    avatar: '',
    image: '',
    website: '',
    github: '',
    twitter: '',
    isRepresentative: false,
    categories: [],
    createdAt: '',
    totalVotes: null,
  })

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  useEffect(() => {
    if (data) {
      setProject(state => ({
        ...state,
        name: data && data.project ? data.project.name : '',
        description: data && data.project ? data.project.description : '',
        avatar: data && data.project ? data.project.avatar : '',
        image: data && data.project ? data.project.image : '',
        website: data && data.project ? data.project.website : '',
        github: data && data.project ? data.project.github : '',
        twitter: data && data.project ? data.project.twitter : '',
        isRepresentative:
          data && data.project ? data.project.isRepresentative : null,
        categories: data && data.project ? data.project.categories : [],
        createdAt: data && data.project ? data.project.createdAt : '',
        totalVotes: data && data.project ? data.project.totalVotes : [],
        currentChallenge:
          data && data.project ? data.project.currentChallenge : {},
        owner: data && data.project ? data.project.owner : {},
      }))
    }
  }, [data])

  const [editProject] = useMutation(EDIT_PROJECT, {
    client: client,
    refetchQueries: [
      {
        query: PROJECT_QUERY,
        variables: {
          id: projectId,
        },
      },
    ],
    optimisticResponse: {
      __typename: 'Mutation',
      editProject: {
        __typename: 'Project',
        id: projectId,
        name: project && project.name,
        description: project.description,
        avatar: project.avatar,
        image: project.image,
        website: project.website,
        github: project.github,
        twitter: project.twitter,
        isRepresentative: project.isRepresentative,
        createdAt: project.createdAt,
        totalVotes: project.totalVotes,
        currentChallenge: project.currentChallenge,
        owner: project.owner && project.owner.id,
        categories: project.categories,
      },
    },
    onError: error => {
      console.error('Error editing a project: ', error)
    },
    onCompleted: data => {
      navigate(`/project/${projectId}`)
    },
    update: (proxy, result) => {
      console.log('AM I HERE')
      const projectData = cloneDeep(
        proxy.readQuery({
          query: PROJECT_QUERY,
          variables: {
            id: projectId,
          },
        }),
      )

      console.log('projectData: ', projectData)

      console.log('Result: ', result)

      proxy.writeQuery({
        query: PROJECT_QUERY,
        variables: {
          id: projectId,
        },
        data: {
          project: { ...projectData.project, ...result.data.editProject },
        },
      })
    },
  })

  const { data: categories } = useQuery(ALL_CATEGORIES_QUERY)

  if (loading && !error) {
    return <Styled.p>Loading</Styled.p>
  }

  if (error) {
    return (
      <Styled.h3>Something went wrong - can&apos;t find a project </Styled.h3>
    )
  }

  const handleSubmit = async project => {
    setIsDisabled(true)
    editProject({ variables: { ...project, projectId: projectId } })
    // navigate(`/project/${projectId}`)
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
      sx={{ gridTemplateColumns: ['1fr', '312px 1fr'], position: 'relative' }}
      gap={[1, 4, 8]}
    >
      <Box>
        <Styled.h1 sx={{ color: 'white', mb: 3 }}>Edit Project</Styled.h1>
        <p sx={{ variant: 'text.field' }}>
          Edit your project in the Everest registry, a universally shared list
          of projects in Web3. <br />
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
          buttonText="Update project"
          categories={categories ? categories.categories : []}
        />
      </Box>
    </Grid>
  )
}

EditProject.propTypes = {
  pageContext: PropTypes.any,
  location: PropTypes.any,
}

export default EditProject
