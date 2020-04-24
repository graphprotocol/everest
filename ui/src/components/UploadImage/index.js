/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Close from '../../images/close.svg'
import Loading from '../Loading'

const UPLOAD_IMAGE = gql`
  mutation uploadImage($image: File!) {
    uploadImage(image: $image) @client
  }
`

const UploadImage = ({ parentImage, setParentImage }) => {
  const [image, setImage] = useState(parentImage)
  const [uploadImage, { loading: loadingImage }] = useMutation(UPLOAD_IMAGE, {
    onError: error => {
      console.error('Error uploading image to IPFS: ', error)
    },
    onCompleted: data => {
      if (data) {
        setImage(data.uploadImage)
        setParentImage(data.uploadImage)
      }
    },
  })

  const handleUpload = async e => {
    const image = e.target.files[0]
    if (image) {
      uploadImage({ variables: { image } })
    }
  }

  const removeImage = e => {
    e.preventDefault()
    e.stopPropagation()
    setImage('')
    setParentImage('')
  }

  useEffect(() => {
    setImage(parentImage)
  }, [parentImage])

  return (
    <label
      sx={
        image
          ? {
              ...styles.label,
              border: 'none',
              backgroundColor: 'white',
              width: '100%',
              pr: 3,
            }
          : {
              ...styles.label,
              width: ['100%', '250px', '250px'],
              boxShadow: 'none',
              height: '48px',
              '&:hover': {
                boxShadow: 'none',
                border: '1px solid white',
              },
            }
      }
    >
      <input
        sx={styles.input}
        name="upload-image"
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />
      {image ? (
        <Grid sx={styles.grid} gap={0}>
          <img
            src={`${process.env.GATSBY_IPFS_HTTP_URI}cat?arg=${image}`}
            sx={{
              height: '60px',
              width: '60px',
              position: 'relative',
              objectFit: 'contain',
            }}
            alt={image}
          />
          <p sx={{ variant: 'text.small' }}>{image}</p>
          <Close
            sx={{
              transform: 'rotate(90deg)',
              fill: 'secondary',
              position: 'absolute',
              right: 4,
              top: 0,
              bottom: 0,
              margin: 'auto',
              width: '16px',
              height: '16px',
              padding: 1,
            }}
            onClick={removeImage}
          />
        </Grid>
      ) : (
        <Grid
          sx={{
            gridTemplateColumns: 'max-content max-content',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 1s ease',
          }}
          gap={2}
        >
          {loadingImage ? (
            <span>
              Uploading
              <Loading
                variant="white"
                sx={{ height: '40px', left: 'auto', right: '30px', top: '5px' }}
              />
            </span>
          ) : (
            <span>Upload image</span>
          )}
        </Grid>
      )}
    </label>
  )
}

const styles = {
  grid: {
    gridTemplateColumns: '76px 1fr',
    textAlign: 'left',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    bg: 'transparent',
    fontFamily: 'body',
    fontSize: '1rem',
    letterSpacing: '1px',
    lineHeight: '3rem',
    height: '60px',
    cursor: 'pointer',
    display: 'block',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.64)',
    width: '100%',
    boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transition: 'all 0.3s ease',
      boxShadow:
        '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
    },
  },
  input: {
    fontSize: 0,
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    cursor: 'pointer',
  },
}

UploadImage.propTypes = {
  setParentImage: PropTypes.func,
  parentImage: PropTypes.string,
}

export default UploadImage
