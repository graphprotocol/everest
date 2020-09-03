/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import queryString from 'query-string'

import client from '../../utils/apollo/client'

import { EDIT_PROJECT } from '../../utils/apollo/mutations'
import { PROJECT_QUERY } from '../../utils/apollo/queries'
import { ALL_CATEGORIES_QUERY } from '../../utils/apollo/queries'
import { ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

import ProjectForm from '../../components/ProjectForm'
import Loading from '../../components/Loading'

const EditProject = ({ location }) => {
  const queryParams = location ? queryString.parse(location.search) : null
  const projectId = queryParams ? queryParams.id : null

  const [isDisabled, setIsDisabled] = useState(false)
  const [pendingTransaction, setPendingTransaction] = useState(false)
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
      }))
    }
  }, [data])

  const [editProject] = useMutation(EDIT_PROJECT, {
    client: client,
    onError: error => {
      console.error(`Error with project ${projectId}: ${error.message}`)
      setPendingTransaction(false)
    },
    onCompleted: () => {
      setPendingTransaction(false)
      navigate(`/project/${projectId}/`)
    },
  })

  const { data: categories } = useQuery(ALL_CATEGORIES_QUERY, {
    variables: {
      orderBy: ORDER_BY.Name,
      orderDirection: ORDER_DIRECTION.ASC,
    },
  })

  if (error) {
    return (
      <Styled.h3>Something went wrong - can&apos;t find a project </Styled.h3>
    )
  }

  const handleSubmit = async project => {
    setIsDisabled(true)
    editProject({ variables: { ...project, projectId: projectId } })
    setPendingTransaction(true)
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
      sx={{ gridTemplateColumns: ['1fr', '312px 504px'], position: 'relative' }}
      gap={[1, 4, 8]}
    >
      <Box>
        <Styled.h1 sx={{ color: 'white', mb: 3 }}>Edit Project</Styled.h1>
        <p sx={{ variant: 'text.field' }}>
          Edit your project in the Everest registry, a universally shared list
          of projects in Web3. <br />
          <br />
          A project can be a dApp, DAO, protocol, NGO, research group, service
          provider and more! <br />
          <br />
          Make sure to tag your project&apos;s categories to allow other users
          to search for your project.
        </p>
      </Box>
      <Box sx={{ position: 'relative' }}>
        {loading && <Loading variant="white" />}
        {pendingTransaction && (
          <Box
            sx={{
              position: 'fixed',
              width: '420px',
              height: '80px',
              textAlign: 'center',
              margin: '0 auto',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <Styled.h6 sx={{ color: 'white', fontWeight: 'heading' }}>
              Waiting for transaction{' '}
            </Styled.h6>
            <Loading variant="white" />
          </Box>
        )}
        <ProjectForm
          project={project}
          isDisabled={isDisabled}
          handleSubmit={handleSubmit}
          setValue={setValue}
          setDisabled={setDisabled}
          buttonText="Update project"
          categories={categories ? categories.categories : []}
          sx={
            pendingTransaction ? { opacity: 0.32, pointerEvents: 'none' } : {}
          }
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
