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

import { ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

import ProjectForm from '../../components/ProjectForm'
import Loading from '../../components/Loading'
import {
  addProjectDocument,
  allCategoriesDocument,
  daiBalanceDocument,
  profileDocument,
} from '../../../.graphclient'

const NewProject = () => {
  const { account } = useAccount()
  const [isDisabled, setIsDisabled] = useState(true)
  const [pendingTransaction, setPendingTransaction] = useState(false)
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

  console.log(project)

  const defaultImages = [
    'QmbJvMyzrYUj5PmNWdhTTi9DmeHiuKRzsrme4FSSpyjFrR',
    'QmXY6HVy7Srsvpr9yCZXH26rix3mvYbA2YgnniVGGkvAkH',
    'QmXfa92BghDQ43FHp2yMdeWG8RCYVKtCpYyaNXHfP9UpRg',
    'QmSA4XDRp99oZvvP23DqGvpumQYRCagiBjJRWVXv2vDb3U',
    'QmcNeKgoexULU7SNbwngByE7nfRvgHFcFj5en1ffDvVBLQ',
    'QmTmtdP8s5LpfQ1gmDDUGmitcHjV79PtouZFJU1qSTgfDw',
    'QmY7jyrRT5py1TnSuFfWzHM2fh2wGevwiBJDJzLximGQY7',
    'QmQLbJiUWsQaZHmTcRoCKsv7R2Krg12fJUzRAmvuhZErYZ',
    'QmP1EoSu2ynjU7B6ADRPm47eQsqNmvYCsGvRo51vriQDtD',
    'QmSPurhnbFzuRwcGVyd7G5RwjE4s6rvCTdnfAcL7HX7cdu',
    'QmZ2MB3iuf6rcJfYvACX7qWXpbJvWHK4VDGVy8W93njQQF',
    'QmWm3yuTUgdPrcBKTqZXzkF1u5KvJ4Ko1X4KCLPNJ9QKCQ',
    'Qmc3f6XtthPSnoRDmPqKZoqTXMfiaJP8RnTHmZu8anWzdx',
  ]

  const defaultImage = defaultImages[Math.floor(Math.random() * 11 + 1)]

  const { data: categories } = useQuery(allCategoriesDocument, {
    variables: {
      orderBy: ORDER_BY.Name,
      orderDirection: ORDER_DIRECTION.ASC,
    },
  })
  const { data: profile } = useQuery(profileDocument, {
    variables: {
      id: account,
      orderBy: ORDER_BY['Name'],
      orderDirection: ORDER_DIRECTION.ASC,
    },
    skip: !account,
  })

  let mutationOptions
  if (profile && profile.user === null) {
    mutationOptions = {
      client: client,
      onError: error => {
        console.error('Error adding a project: ', error)
        setPendingTransaction(false)
      },
      onCompleted: data => {
        setPendingTransaction(false)
        if (data && data.addProject && data.addProject.id) {
          navigate(`/project/${data.addProject.id}/`)
        } else {
          navigate(`/profile?id=${account}`)
        }
      },
    }
  } else {
    mutationOptions = {
      client: client,
      refetchQueries: [
        {
          query: profileDocument,
          variables: {
            id: account,
            orderBy: ORDER_BY['Name'],
            orderDirection: ORDER_DIRECTION.ASC,
          },
        },
      ],
      optimisticResponse: {
        __typename: 'Mutation',
        addProject: {
          id: '123',
          name: project.name,
          description: project.description,
          avatar: project.avatar ? project.avatar : defaultImage,
          image: project.image,
          website: project.website,
          github: project.github,
          twitter: project.twitter,
          isRepresentative: project.isRepresentative,
          createdAt: moment().unix(),
          currentChallenge: null,
          categories: project.categories,
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
            query: profileDocument,
            variables: {
              id: account,
              orderBy: ORDER_BY['Name'],
              orderDirection: ORDER_DIRECTION.ASC,
            },
          }),
        )

        proxy.writeQuery({
          query: profileDocument,
          variables: {
            id: account,
            orderBy: ORDER_BY['Name'],
            orderDirection: ORDER_DIRECTION.ASC,
          },
          data: {
            user: {
              id: account,
              __typename: 'User',
              delegatorProjects:
                profileData && profileData.user
                  ? profileData.user.delegatorProjects
                  : [],
              projects:
                profileData && profileData.user
                  ? [...profileData.user.projects, result.data.addProject]
                  : [result.data.addProject],
            },
          },
        })
      },
    }
  }

  const [daiBalance] = useMutation(daiBalanceDocument, {
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

  const [addProject] = useMutation(addProjectDocument, mutationOptions)

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
      avatar: project.avatar ? project.avatar : defaultImage,
    }
    addProject({
      variables: data,
    })
    if (profile && profile.user) {
      navigate(`/profile/?id=${account}`)
    } else {
      setPendingTransaction(true)
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
          A project can be a dApp, DAO, protocol, NGO, research group, service
          provider and more! <br />
          <br />
          Make sure to tag your project&apos;s categories to allow other users
          to search for your project.
        </p>
        <p sx={{ variant: 'text.field', mt: 5 }}>Listing fee</p>
        <p sx={{ variant: 'text.huge', color: 'white' }}>10 DAI</p>
      </Box>
      <Box sx={{ position: 'relative' }}>
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
          buttonText="Add project"
          setImage={setImage}
          categories={categories ? categories.categories : []}
          sx={
            pendingTransaction ? { opacity: 0.32, pointerEvents: 'none' } : {}
          }
        />
      </Box>
    </Grid>
  )
}

export default NewProject
