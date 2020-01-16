/** @jsx jsx */
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { navigate } from 'gatsby'
import ipfs from '../../services/ipfs'
import fetch from 'isomorphic-fetch'
import { useQuery } from '@apollo/react-hooks'
import { PROJECT_QUERY } from '../../utils/queries'
import { useEverestContract, useAddress, useProvider } from '../../utils/hooks'
import { ethers } from 'ethers'

import ProjectForm from '../../components/ProjectForm'

const EditProject = ({ location, ...props }) => {
  const projectId = location ? location.pathname.split('/')[2] : ''
  const [everestContract] = useState(useEverestContract())
  const [address, setAddress] = useState(useAddress())
  const [provider, setProvider] = useState(useProvider())

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
  }, [])

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
          // TODO: create a random wallet, generate private/public key
          // pass this into the contract function ??
          // public key is the project ID

          let offChainDataName =
            '0x50726f6a65637444617461000000000000000000000000000000000000000000'
          // unix timestamp in seconds for Jan 12, 2070
          let offChainDataValidity = 3156895760
          let wallet = await ethers.Wallet(provider)
          // hash of all params and types, 2 arrays
          let signaturePromise = await wallet.signMessage(
            [
              'bytes1',
              'bytes1',
              'address',
              'uint256',
              'address',
              'string',
              'bytes32',
              'uint256',
            ],
            [
              '0x19',
              '0x0',
              '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
              0,
              projectId, // project address
              'setAttribute',
              offChainDataName,
              offChainDataValidity,
            ],
          )
          signaturePromise.then(async signature => {
            let { r, s, v } = ethers.utils.splitSignature(signature)
            console.log('r, s, v ', r, s, v)
            // TODO: call the correct contract function (no need to register a user)
            // just editing the project data (new ipfs hash)
            const transaction = await everestContract.editOffChainDataSigned(
              projectId, // project identity (from subgraph)
              v,
              r,
              s,
              address, // this is the "owner" ?
              offChainDataName,
              responseJSON.IpfsHash,
              offChainDataValidity,
            )
            console.log('transaction: ', transaction)
          })
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
          <p sx={{ variant: 'text.displayBig', color: 'white' }}>10 DAI</p>
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
