/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { useQuery } from '@apollo/react-hooks'

import ipfs from '../../services/ipfs'
import { ipfsHexHash } from '../../services/ipfs'
import { useEthereumDIDRegistry } from '../../utils/hooks'
import {
  OFFCHAIN_DATANAME,
  VALIDITY_TIMESTAMP,
} from '../../utils/helpers/metatransactions'
import { PROJECT_QUERY } from '../../utils/queries'

import ProjectForm from '../../components/ProjectForm'

const EditProject = ({ location }) => {
  const projectId = location ? location.pathname.split('/')[2] : ''
  const [ethereumDIDRegistryContract] = useState(useEthereumDIDRegistry())

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
    return <Styled.p>Loading</Styled.p>
  }

  if (error) {
    return (
      <Styled.h3>Something went wrong - can&apos;t find a project </Styled.h3>
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
    const projectData = Buffer.from(JSON.stringify(project))

    console.log('projectData: ', projectData)

    await ipfs.add(projectData, async (err, response) => {
      if (err) {
        console.error('Error saving doc to IPFS: ', err)
      }

      if (response && response[0].hash) {
        const ipfsHash = response[0].hash
        console.log('IPFS HASH: ', response[0].hash)

        const transaction = ethereumDIDRegistryContract(
          project.id,
          OFFCHAIN_DATANAME,
          ipfsHexHash(ipfsHash),
          VALIDITY_TIMESTAMP,
        )

        transaction
          .wait()
          .then(() => console.log('SUUCCESSFULE'))
          .catch(err => console.error('TRansaction error: ', err))
      }
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
          uploadImage={uploadImage}
          isDisabled={isDisabled}
          handleSubmit={handleSubmit}
          setValue={setValue}
          setDisabled={setDisabled}
          buttonText="Update project"
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
