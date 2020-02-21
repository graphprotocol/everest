/** @jsx jsx */
import { useRef } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import TextareaAutosize from 'react-textarea-autosize'

import MultiSelect from '../Filters/MultiSelect'
import Select from '../Filters/Select'
import UploadImage from '../UploadImage'

const Field = ({
  title,
  type,
  text,
  imageName,
  imageUrl,
  placeholder,
  charsCount,
  value,
  setValue,
  multiselect,
  items,
  setImage,
}) => {
  const charRef = useRef()

  if (value && value.length === charsCount) {
    charRef.current.style = `opacity: 1; transition: all 0.3s ease;`
    setTimeout(() => {
      charRef.current.style = 'opacity: 0.4; transition: all 0.3s ease '
    }, 500)
  }

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
          <TextareaAutosize
            minRows={1}
            maxRows={6}
            placeholder={placeholder}
            onChange={e => {
              const value = e.target ? e.target.value : ''
              setValue(value)
            }}
            maxLength={charsCount}
            value={value}
          />
        ) : type === 'filters' ? (
          multiselect === true ? (
            <MultiSelect setValue={setValue} title={title} type="categories">
              <p
                sx={{
                  color: 'white',
                  opacity: 0.64,
                  variant: 'text.large',
                }}
              >
                <span>Pick categories</span>
              </p>
              <Box
                sx={{
                  justifySelf: 'end',
                  height: '9px',
                  width: '9px',
                  borderTop: '2px solid',
                  borderRight: '2px solid',
                  borderColor: 'white',
                  transform: 'rotate(135deg)',
                }}
              />
            </MultiSelect>
          ) : (
            <Select items={items} />
          )
        ) : type === 'upload' ? (
          <UploadImage
            imageName={imageName}
            imageUrl={imageUrl}
            setImage={setImage}
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
              color: 'white',
              alignSelf: 'end',
              opacity: 0.4,
            }}
            ref={charRef}
          >
            {value.length}/{charsCount}
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
    transition: 'all 0.3s ease',
    '&>p': {
      variant: 'text.field',
      mb: 2,
    },
    '& input, & textarea': {
      width: '100%',
      background: 'none',
      border: 'none',
      outline: 'none',
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
      letterSpacing: '-0.4',
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
    '&:hover': {
      borderColor: 'white',
      transition: 'all 0.3s ease',
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
  charsCount: PropTypes.number,
  multiselect: PropTypes.bool,
  text: PropTypes.string,
  imageName: PropTypes.string,
  imageUrl: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  setValue: PropTypes.func,
  setImage: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
}

export default Field
