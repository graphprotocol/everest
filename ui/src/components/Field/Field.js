/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import Filters from '../Filters'
import UploadImage from '../UploadImage'

const Field = ({
  title,
  type,
  field,
  text,
  imageName,
  imageUrl,
  uploadImage,
  placeholder,
  charsCount,
  value,
  setValue,
}) => {
  return (
    <Box
      sx={{
        ...styles.field,
        borderBottom:
          type === 'input' || type === 'textarea'
            ? '1px solid rgba(255,255,255,0.32)'
            : 'none',
      }}
    >
      <p>{title}</p>
      {text && <p sx={{ opacity: 0.64 }}>{text}</p>}
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '1fr max-content', '1fr max-content'],
        }}
      >
        {type === 'input' ? (
          <input
            placeholder={placeholder}
            onChange={e => {
              const value = e.target ? e.target.value : ''
              setValue(value)
            }}
            maxLength={charsCount}
            value={value}
          />
        ) : type === 'textarea' ? (
          <textarea
            placeholder={placeholder}
            onChange={e => {
              const value = e.target ? e.target.value : ''
              setValue(value)
            }}
            maxLength={charsCount}
            value={value}
          ></textarea>
        ) : type === 'filters' ? (
          <Filters setValue={setValue} />
        ) : type === 'upload' ? (
          <UploadImage
            imageName={imageName}
            imageUrl={imageUrl}
            uploadImage={uploadImage}
          />
        ) : (
          <label sx={styles.toggle}>
            <input
              type="checkbox"
              onClick={e => {
                const value = e.target.checked
                setValue(value)
              }}
              checked={value}
            />
            <span sx={styles.slider}></span>
          </label>
        )}
        {charsCount && (
          <p
            sx={{
              variant: 'text.field',
              color: 'whiteFaded',
              alignSelf: 'end',
            }}
          >
            {charsCount - value.length} characters
          </p>
        )}
      </Grid>
    </Box>
  )
}

const styles = {
  field: {
    width: '100%',
    mb: '40px',
    pb: 2,
    '&>p': {
      variant: 'text.field',
      mb: 2,
    },
    '& input, & textarea': {
      width: '100%',
      background: 'none',
      border: 'none',
      outline: 'none',
      fontSize: '1.375rem',
      lineHeight: '1.75rem',
      color: 'white',
      fontFamily: 'body',
      fontWeight: 'body',
      '&::placeholder': {
        color: 'whiteFaded',
      },
    },
    '& textarea': {
      height: '80px',
      resize: 'none',
    },
  },
  toggle: {
    position: 'relative',
    width: '48px',
    height: '24px',
    display: 'inline-block',
    '& input': {
      opacity: 0,
      width: 0,
      height: 0,
    },
    '& input:checked + span': {
      backgroundColor: 'white',
    },
    '& input:checked + span:before': {
      transform: 'translateX(16px)',
      backgroundColor: 'secondary',
    },
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
      transition: '.4s',
    },
  },
}

Field.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  charsCount: PropTypes.string,
}

export default Field
