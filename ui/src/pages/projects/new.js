/** @jsx jsx */
import { useState } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
// import { navigate } from 'gatsby'
import { ethers, utils } from 'ethers'

import ipfs, { ipfsHexHash } from '../../services/ipfs'
import { useEverestContract, useAddress } from '../../utils/hooks'
import { overrides } from '../../services/ethers'
import {
  changeOwnerSignedData,
  setAttributeData,
  permitSignedData,
  VALIDITY_TIMESTAMP,
} from '../../utils/helpers/metatransactions'

import ProjectForm from '../../components/ProjectForm'

const NewProject = () => {
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
  const [everestContract] = useState(useEverestContract())
  const [address] = useAddress()

  const setImage = (field, data) => {
    if (field === 'logo') {
      setProject(state => ({
        ...state,
        logoUrl: data.url,
        logoName: data.name,
      }))
    } else {
      setProject(state => ({
        ...state,
        imageUrl: data.url,
        imageName: data.name,
      }))
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
        // Create random wallet
        const randomWallet = ethers.Wallet.createRandom()
        const randomWalletAddress = randomWallet.signingKey.address
        const offChainDataName =
          '0x50726f6a65637444617461000000000000000000000000000000000000000000'

        const signedMessage1 = await randomWallet.signMessage(
          changeOwnerSignedData(randomWalletAddress, address),
        )

        const signedMessage2 = await randomWallet.signMessage(
          permitSignedData(randomWalletAddress, address),
        )

        const signedMessage3 = await randomWallet.signMessage(
          setAttributeData(randomWalletAddress, ipfsHash, offChainDataName),
        )

        const sig1 = utils.splitSignature(signedMessage1)
        const sig2 = utils.splitSignature(signedMessage2)
        const sig3 = utils.splitSignature(signedMessage3)

        let { v: v1, r: r1, s: s1 } = sig1
        let { v: v2, r: r2, s: s2 } = sig2
        let { v: v3, r: r3, s: s3 } = sig3

        const transaction = await everestContract.applySignedWithAttribute(
          randomWalletAddress,
          [v1, v2],
          [r1, r2],
          [s1, s2],
          address,
          v3,
          r3,
          s3,
          offChainDataName,
          ipfsHexHash(response[0].hash),
          VALIDITY_TIMESTAMP,
          overrides,
        )
        console.log('transaction: ', transaction)

        transaction
          .wait()
          .then(() => console.log('SUCCESSFUL ADD PROJECT'))
          .catch(err => console.error('TRansaction error: ', err))

        // navigate('/project/ck3t4oggr8ylh0922vgl9dwa9')
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
        <ProjectForm
          project={project}
          isDisabled={isDisabled}
          handleSubmit={handleSubmit}
          setValue={setValue}
          setDisabled={setDisabled}
          buttonText="Add project"
          setImage={setImage}
        />
      </Box>
    </Grid>
  )
}

export default NewProject
