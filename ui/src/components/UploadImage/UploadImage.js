/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

const UploadImage = ({ imageName, imageUrl, uploadImage }) => {
  return (
    <label
      sx={
        imageName && imageUrl
          ? {
              ...styles.label,
              border: 'none',
              backgroundColor: 'white',
              width: 'fit-content',
              pr: 3
            }
          : styles.label
      }
    >
      <input
        sx={styles.input}
        name="upload-image"
        type="file"
        accept="image/*"
        onChange={uploadImage}
      />
      {imageUrl && imageName ? (
        <Grid sx={styles.grid} gap={0}>
          <img
            src={imageUrl}
            sx={{ height: '48px', width: '48px' }}
            alt={imageName}
          />
          <Styled.p>{imageName}</Styled.p>
        </Grid>
      ) : (
        <span>Upload image</span>
      )}
    </label>
  )
}

const styles = {
  grid: {
    gridTemplateColumns: '56px 1fr',
    textAlign: 'left',
    alignItems: 'center'
  },
  label: {
    color: 'white',
    bg: 'transparent',
    fontFamily: 'body',
    fontSize: '1rem',
    letterSpacing: '1px',
    lineHeight: '3rem',
    width: ['100%', '250px', '250px'],
    height: '48px',
    cursor: 'pointer',
    display: 'block',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid white'
  },
  input: {
    fontSize: 0,
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    cursor: 'pointer'
  }
}

UploadImage.propTypes = {
  imageName: PropTypes.string,
  imageUrl: PropTypes.string,
  uploadImage: PropTypes.func
}

export default UploadImage
