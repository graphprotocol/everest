/** @jsx jsx */
import { useState } from 'react'
import Layout from '../../components/Layout'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { navigate } from 'gatsby'
import ipfs from '../../services/ipfs'

import Button from '../../components/Button'
import Field from '../../components/Field'

const NewProject = ({ data, ...props }) => {
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
    isRepresentative: null
  })

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
                logoName: image.name
              }))
            } else {
              setProject(state => ({
                ...state,
                imageUrl: url,
                imageName: image.name
              }))
            }
          }
        })
      }
    }
  }

  const handleSubmit = async project => {
    setIsDisabled(true)
    const content = Buffer.from(JSON.stringify(project))
    await ipfs.add(content, async (err, res) => {
      if (err) {
        setIsDisabled(false)
        console.error('Error saving doc to IPFS: ', err)
      }
      if (res) {
        // TODO: Replace this with ID of the project (contract call)
        navigate('/project/ck3t4oggr8ylh0922vgl9dwa9')
      }
    })
  }

  return (
    <Layout sx={{ backgroundColor: 'secondary' }} {...props}>
      <Grid sx={styles.grid} gap={[1, 8]}>
        <Box>
          <Styled.h1 sx={{ color: 'white', mb: 3 }}>Add Project</Styled.h1>
          <p sx={{ variant: 'text.field' }}>
            Add a project to the Everest registry, a universally shared list of
            projects in Web3. <br />
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
          <form sx={{ maxWidth: '504px', width: '100%', mt: [5, 0, 0] }}>
            <Field
              title="Name"
              field="name"
              type="input"
              charsCount="35"
              placeholder="Project Name"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Description"
              field="name"
              type="textarea"
              charsCount="300"
              placeholder="Describe your project"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Category"
              field="category"
              type="filters"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Project logo"
              type="upload"
              field="logo"
              imageName={project.logoName}
              imageUrl={project.logoUrl}
              project={project}
              setProject={setProject}
              uploadImage={uploadImage}
            />
            <Field
              title="Project image"
              type="upload"
              field="image"
              imageName={project.imageName}
              imageUrl={project.imageUrl}
              project={project}
              setProject={setProject}
              uploadImage={uploadImage}
            />
            <Field
              title="Website"
              field="website"
              type="input"
              placeholder="Project website"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Github"
              field="github"
              type="input"
              placeholder="Github url"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Twitter"
              field="twitter"
              type="input"
              placeholder="Twitter url"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Field
              title="Project representative"
              text="Are you a project representative"
              field="isRepresentative"
              type="checkbox"
              project={project}
              setProject={setProject}
              setIsDisabled={setIsDisabled}
            />
            <Button
              disabled={isDisabled}
              variant="secondary"
              onClick={e => {
                e.preventDefault()
                handleSubmit(project)
              }}
              text="Add project"
            />
          </form>
        </Box>
      </Grid>
    </Layout>
  )
}

const styles = {
  toggle: {
    position: 'relative',
    width: '48px',
    height: '24px',
    display: 'inline-block',
    '& input': {
      opacity: 0,
      width: 0,
      height: 0
    },
    '& input:checked + span': {
      backgroundColor: 'white'
    },
    '& input:checked + span:before': {
      transform: 'translateX(16px)',
      backgroundColor: 'secondary'
    }
  },
  slider: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    cursor: 'pointer',
    top: 0,
    left: 0,
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '14px',
    transition: '.4s',
    '&:before': {
      position: 'absolute',
      content: 'close-quote',
      height: '16px',
      width: '24px',
      borderRadius: '14px',
      left: '4px',
      bottom: '4px',
      backgroundColor: 'white',
      boxShadow: '0 4px 16px 0 rgba(12,10,29,0.08)',
      transition: '.4s'
    }
  },
  grid: {
    gridTemplateColumns: ['1fr', '312px 1fr'],
    position: 'relative'
  }
}

export default NewProject
