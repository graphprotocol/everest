/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import cloneDeep from 'lodash.clonedeep'

import client from '../../utils/apollo/client'

import { EDIT_PROJECT } from '../../utils/apollo/mutations'
import { PROJECT_QUERY } from '../../utils/apollo/queries'
import { PROJECTS_QUERY } from '../../utils/apollo/queries'
import { CATEGORIES_QUERY } from '../../utils/apollo/queries'

import ProjectForm from '../../components/ProjectForm'

const EditProject = ({ location }) => {
  const projectId = location ? location.pathname.split('/')[2] : ''
  const [isDisabled, setIsDisabled] = useState(false)
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

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const [
    editProject,
    {
      data: mutationData,
      loading: mutationLoading,
      error: errorLoading,
      state,
    },
  ] = useMutation(EDIT_PROJECT, {
    client: client,
    // refetchQueries: [
    //   {
    //     query: PROJECT_QUERY,
    //     variables: {
    //       id: projectId,
    //     },
    //   },
    // ],
    // optimisticResponse: {
    //   __typename: 'Mutation',
    //   editProject: {
    //     id: projectId,
    //     ...project,
    //     __typename: 'Project',
    //   },
    // },
    onError: error => {
      console.error('Error editing a project: ', error)
    },
    onCompleted: mydata => {
      if (data) {
        console.log('COMPLETED: ', mydata.editProject)
      }
    },
    // update: (proxy, result) => {
    //   const somedata = cloneDeep(
    //     proxy.readQuery({
    //       query: PROJECTS_QUERY,
    //     }),
    //   )

    //   if (result.data && result.data.editProject) {
    //     console.log('RESULT.DATA ', result.data)
    //     console.log('DATA: ', somedata)
    //     somedata.projects.push(addProject)
    //   }
    //   proxy.writeQuery({
    //     query: PROJECTS_QUERY,
    //     somedata,
    //   })
    // },
  })

  // const { data: categories } = useQuery(CATEGORIES_QUERY)

  useEffect(() => {
    if (data) {
      let projectObj = data && data.project
      setProject(state => ({
        ...state,
        name: projectObj ? projectObj.name : '',
        description: projectObj ? projectObj.description : '',
        avatar: projectObj ? projectObj.avatar : '',
        image: projectObj ? projectObj.image : '',
        website: projectObj ? projectObj.website : '',
        github: projectObj ? projectObj.github : '',
        twitter: projectObj ? projectObj.twitter : '',
        isRepresentative: projectObj ? projectObj.isRepresentative : null,
        // categories: projectObj ? projectObj.categories : [],
      }))
    }
  }, [data])

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
    console.log('PRJOECT: ', project)
    editProject({ variables: { ...project, projectId: projectId } })
  }

  const setValue = async (field, value) => {
    await setProject(state => ({
      ...state,
      [field]: value,
    }))
  }

  const setDisabled = value => {
    // if (typeof value === 'string') {
    //   setIsDisabled(
    //     !(
    //       value.length > 0 &&
    //       project.categories &&
    //       project.categories.length > 0
    //     ),
    //   )
    // } else {
    //   setIsDisabled(
    //     !(
    //       value.length > 0 &&
    //       project.description !== '' &&
    //       project.name !== ''
    //     ),
    //   )
    // }
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
          categories={[]}
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
