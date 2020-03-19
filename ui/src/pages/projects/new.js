/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useMutation } from '@graphprotocol/mutations-apollo-react'
import { useQuery } from '@apollo/react-hooks'
import { navigate } from 'gatsby'
import fetch from 'isomorphic-fetch'

import client from '../../utils/apollo/client'
import { useAccount } from '../../utils/hooks'

import { ADD_PROJECT, DAI_BALANCE } from '../../utils/apollo/mutations'
import { ALL_CATEGORIES_QUERY } from '../../utils/apollo/queries'

import ProjectForm from '../../components/ProjectForm'

const NewProject = () => {
  const { account } = useAccount()
  const [isDisabled, setIsDisabled] = useState(true)
  const [daiAmount, setDaiAmount] = useState(null)
  const [pending, setPending] = useState(false)
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
    onCompleted: async data => {
      if (data && data.addProject) {
        const params = {
          projectId: data.addProject.id,
          title: data.addProject.name,
          description: data.addProject.description,
          image: `https://api.staging.thegraph.com/ipfs/api/v0/cat?arg=${data.addProject.avatar}`,
        }
        // Build project page
        await fetch(`${process.env.GATSBY_API_ENDPOINT}project/build`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        })
        setPending(false)
        navigate(`/project/${data.addProject.id}`)
      }
    },
    onError: error => {
      console.error('Error adding a project: ', error)
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
    setPending(true)
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
        {pending && (
          <Box
            sx={{
              position: 'absolute',
              margin: '120px 0 120px 60px',
              textAlign: 'center',
            }}
          >
            <Styled.h4 sx={{ color: 'white' }}>
              Processing your transaction
            </Styled.h4>
            <img src="/loading-dots-white.gif" />
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
          sx={{
            opacity: pending ? 0.36 : 1,
            pointerEvents: pending ? 'none' : 'all',
          }}
        />
      </Box>
    </Grid>
  )
}

export default NewProject
