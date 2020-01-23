/** @jsx jsx */
import { useState, useEffect } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import fetch from 'isomorphic-fetch'
import { useQuery } from '@apollo/react-hooks'

import ipfs from '../../services/ipfs'
import { ipfsHexHash } from '../../services/ipfs'
import {
  useEverestContract,
  useEthereumDIDRegistry,
  useAddress,
  useProvider,
} from '../../utils/hooks'
import {
  OFFCHAIN_DATANAME,
  VALIDITY_TIMESTAMP,
} from '../../utils/helpers/metatransactions'
import { PROJECT_QUERY } from '../../utils/queries'

import Layout from '../../components/Layout'
import ProjectForm from '../../components/ProjectForm'

const EditProject = ({ location, ...props }) => {
  const projectId = location ? location.pathname.split('/')[2] : ''
  const [everestContract] = useState(useEverestContract())
  const [ethereumDIDRegistryContract] = useState(useEthereumDIDRegistry())

  const [address] = useState(useAddress())
  const [provider] = useState(useProvider())

  const { loading, error, data } = useQuery(PROJECT_QUERY, {
    variables: {
      id: projectId,
    },
  })

  const [isDisabled, setIsDisabled] = useState(true)
  const [project, setProject] = useState({
    name: '',
    description: '',
    logoName: '',
    logoUrl: '',
    imageName: '',
    imageUrl: '',
    website: '',
    github: '',
    twitter: '',
    isRepresentative: null,
    categories: [],
  })

  useEffect(() => {
    if (data) {
      let projectObj = data && data.project
      setProject(state => ({
        ...state,
        name: projectObj ? projectObj.name : '',
        description: projectObj ? projectObj.description : '',
        logoName:
          projectObj && projectObj.avatar
            ? projectObj.avatar
                .split('/')
                .slice(-1)
                .join('')
            : '',
        logoUrl: projectObj ? projectObj.avatar : '',
        imageName:
          projectObj && projectObj.image
            ? projectObj.image
                .split('/')
                .slice(-1)
                .join('')
            : '',
        imageUrl: projectObj ? projectObj.image : '',
        website: projectObj ? projectObj.website : '',
        github: projectObj ? projectObj.github : '',
        twitter: projectObj ? projectObj.twitter : '',
        isRepresentative: projectObj ? projectObj.isRepresentative : null,
        categories: projectObj ? projectObj.categories : [],
      }))
    }
  }, [data])

  if (loading && !error) {
    return (
      <Layout>
        <Styled.p>Loading</Styled.p>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Styled.h3>Something went wrong - can't find a project </Styled.h3>
      </Layout>
    )
  }

  const uploadImage = async (e, field) => {
    const image = e.target.files[0]
    if (image) {
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(image)
      reader.onloadend = async () => {
        const buffer = await Buffer.from(reader.result)
        await ipfs.add(buffer, async (err, res) => {
          if (err) {
            console.error('Error saving doc to IPFS: ', err)
          }
          if (res) {
            const url = `https://ipfs.infura.io:5001/api/v0/cat?arg=${res[0].hash}`
            if (field === 'logo') {
              setProject(state => ({
                ...state,
                logoUrl: url,
                logoName: image.name,
              }))
            } else {
              setProject(state => ({
                ...state,
                imageUrl: url,
                imageName: image.name,
              }))
            }
          }
        })
      }
    }
  }

  const handleSubmit = async project => {
    setIsDisabled(true)
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: process.env.GATSBY_PINATA_API_KEY,
        pinata_secret_api_key: process.env.GATSBY_PINATA_API_SECRET_KEY,
      },
      body: JSON.stringify(project),
    })
      .then(async function(response) {
        const responseJSON = await response.json()
        if (responseJSON.IpfsHash) {
          const transaction = ethereumDIDRegistryContract(
            project.id,
            OFFCHAIN_DATANAME,
            ipfsHexHash(responseJSON.IpfsHash),
            VALIDITY_TIMESTAMP,
          )
          // navigate('/project/ck3t4oggr8ylh0922vgl9dwa9')
        }
      })
      .catch(function(error) {
        setIsDisabled(false)
        console.error('Error uploading data to Pinata IPFS: ', error)
      })
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
    <Layout sx={{ backgroundColor: 'secondary' }} {...props}>
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
            Make sure to tag your project's categories to allow other users to
            search for your project.
          </p>
          <p sx={{ variant: 'text.field', mt: 5 }}>Listing fee</p>
          <p sx={{ variant: 'text.huge', color: 'white' }}>10 DAI</p>
        </Box>
        <Box>
          <ProjectForm
            project={project}
            uploadImage={uploadImage}
            isDisabled={isDisabled}
            handleSubmit={handleSubmit}
            setValue={setValue}
            setDisabled={setDisabled}
            buttonText="Update project"
          />
        </Box>
      </Grid>
    </Layout>
  )
}

export default EditProject
