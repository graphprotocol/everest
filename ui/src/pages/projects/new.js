/** @jsx jsx */
import { useState } from 'react'
import { Grid } from '@theme-ui/components'
import { Styled, jsx, Box } from 'theme-ui'
import { navigate } from 'gatsby'
import fetch from 'isomorphic-fetch'
import { ethers, utils } from 'ethers'

import ipfs, { ipfsHexHash } from '../../services/ipfs'
import { useEverestContract, useAddress } from '../../utils/hooks'

import Layout from '../../components/Layout'
import ProjectForm from '../../components/ProjectForm'

const ETHEREUM_DID_REGISTRY = '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'

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
    isRepresentative: null,
    categories: [],
  })
  const [everestContract] = useState(useEverestContract())
  const [address] = useAddress()

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
          // Create random wallet
          const randomWallet = ethers.Wallet.createRandom()
          const randomWalletAddress = randomWallet.signingKey.address
          const offChainDataValidity = 3156895760
          const offChainDataName =
            '0x50726f6a65637444617461000000000000000000000000000000000000000000'

          // create changeOwner signed data
          let changeOwnerSignedData = ethers.utils.solidityKeccak256(
            [
              'bytes1',
              'bytes1',
              'address',
              'uint256',
              'address',
              'string',
              'address',
            ],
            [
              '0x19',
              '0x0',
              ETHEREUM_DID_REGISTRY,
              0,
              randomWalletAddress,
              'changeOwner',
              address,
            ],
          )

          // creates setAttribute transaction  data
          let setAttributeData = utils.solidityKeccak256(
            [
              'bytes1',
              'bytes1',
              'address',
              'uint256',
              'address',
              'string',
              'bytes32',
              'bytes',
              'uint256',
            ],
            [
              '0x19',
              '0x0',
              ETHEREUM_DID_REGISTRY,
              0,
              randomWalletAddress, // project address
              'setAttribute',
              offChainDataName,
              ipfsHexHash(responseJSON.IpfsHash),
              offChainDataValidity,
            ],
          )
          const signedMessage1 = await randomWallet.signMessage(
            changeOwnerSignedData,
          )
          const signedMessage2 = await randomWallet.signMessage(
            setAttributeData,
          )
          const sig1 = utils.splitSignature(signedMessage1)
          const sig2 = utils.splitSignature(signedMessage2)

          let { v1, r1, s1 } = sig1
          let { v2, r2, s2 } = sig2

          const transaction = await everestContract.applySignedWithAttribute(
            randomWalletAddress,
            v1,
            r1,
            s1,
            address,
            v2,
            r2,
            s2,
            offChainDataName,
            ipfsHexHash(responseJSON.IpfsHash),
            offChainDataValidity,
          )
          console.log('transaction: ', transaction)
        }
        // navigate('/project/ck3t4oggr8ylh0922vgl9dwa9')
      })
      .catch(function(error) {
        setIsDisabled(false)
        console.error('ERROR: ', error)
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
    <Layout
      mainStyles={{
        backgroundColor: 'secondary',
        marginTop: -5,
      }}
      {...props}
    >
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
            buttonText="Add project"
          />
        </Box>
      </Grid>
    </Layout>
  )
}

export default NewProject
