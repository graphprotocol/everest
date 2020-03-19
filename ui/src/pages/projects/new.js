/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import cloneDeep from 'lodash.clonedeep'
import { navigate } from 'gatsby'
import moment from 'moment'

import client from '../../utils/apollo/client'
import { useAccount } from '../../utils/hooks'

import { ADD_PROJECT, DAI_BALANCE } from '../../utils/apollo/mutations'
import { ALL_CATEGORIES_QUERY } from '../../utils/apollo/queries'
import { PROFILE_QUERY } from '../../utils/apollo/queries'

import ProjectForm from '../../components/ProjectForm'

const NewProject = () => {
  const { account } = useAccount()
  const [isDisabled, setIsDisabled] = useState(true)
  const [daiAmount, setDaiAmount] = useState(null)
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
  const { data: profile } = useQuery(PROFILE_QUERY, {
    variables: {
      id: account,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    },
  })

  let selectedCategories

  if (categories) {
    selectedCategories =
      project &&
      project.categories &&
      project.categories.map(pc => {
        const category = categories.categories.find(cat => cat.id === pc)
        return { id: category.id, name: category.name, __typename: 'Category' }
      })
  }

  const [daiBalance] = useMutation(DAI_BALANCE, {
    client: client,
    onCompleted: data => {
      if (data && data.daiBalance) {
        setDaiAmount(data.daiBalance)
      }
    },
    onError: error => {
      console.error('Error getting Dai balance: ', error)
    },
  })

  const [addProject] = useMutation(ADD_PROJECT, {
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
      addProject: {
        id: '123',
        name: project.name,
        description: project.description,
        avatar: project.avatar,
        image: project.image,
        website: project.website,
        github: project.github,
        twitter: project.twitter,
        isRepresentative: project.isRepresentative,
        createdAt: moment().unix(),
        currentChallenge: null,
        categories: selectedCategories,
        delegates: [],
        __typename: 'Project',
      },
    },
    onError: error => {
      console.error('Error adding a project: ', error)
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
            projects:
              profileData && profileData.user
                ? [...profileData.user.projects, result.data.addProject]
                : [result.data.addProject],
          },
        },
      })
    },
  })

  useEffect(() => {
    if (account) {
      daiBalance({
        variables: { account: account },
      })
    }
  }, [account])

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
    const data = {
      ...project,
      avatar: !project.avatar
        ? 'QmaJe9Nw47wEEFRsuEp9ox3mmGJoUoK8ruAHKa247Nfet9'
        : project.avatar,
    }
    addProject({
      variables: data,
    })
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
        {daiAmount && parseFloat(daiAmount) < 10 && (
          <Styled.h6
            sx={{
              color: 'white',
              mb: 7,
              mt: -9,
              maxWidth: '504px',
              width: '100%',
              fontWeight: 'heading',
            }}
          >
            You need at least 10 DAI in order to add a project. Please add more
            DAI to your Wallet.
          </Styled.h6>
        )}
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
