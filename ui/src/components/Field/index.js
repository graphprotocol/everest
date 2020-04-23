/** @jsx jsx */
import { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import TextareaAutosize from 'react-textarea-autosize'

import MultiSelect from '../Select/MultiSelect'
import Select from '../Select'
import UploadImage from '../UploadImage'

const Field = ({
  title,
  type,
  text,
  placeholder,
  charsCount,
  value,
  setValue,
  multiselect,
  items,
  image,
  setImage,
  categories,
  selectedItems,
  variant,
  error,
}) => {
  const [invalidTwitter, setInvalidTwitter] = useState(false)
  const [invalidGithub, setInvalidGithub] = useState(false)

  useEffect(() => {
    if (title && title.toLowerCase() === 'twitter') {
      setInvalidTwitter(
        value &&
          (value.includes('https://') ||
            value.includes('http://') ||
            value.startsWith('/') ||
            value.includes('twitter.com') ||
            value.includes('www.') ||
            value.includes('.com') ||
            value.includes('@')),
      )
    }
    if (title && title.toLowerCase() === 'github') {
      setInvalidGithub(
        value &&
          (value.includes('https://') ||
            value.includes('http://') ||
            value.startsWith('/') ||
            value.includes('github.com') ||
            value.includes('www.') ||
            value.includes('.com') ||
            value.includes('@')),
      )
    }
  }, [value])

  const charRef = useRef()

  if (value && value.length === charsCount) {
    if (charRef.current)
      charRef.current.style = `opacity: 1; transition: all 0.3s ease;`
    setTimeout(() => {
      if (charRef.current)
        charRef.current.style = 'opacity: 0.4; transition: all 0.3s ease '
    }, 500)
  }

  let color =
    invalidTwitter || invalidGithub
      ? '#fd8a45'
      : error
      ? '#ED4A6D'
      : 'rgba(255,255,255,0.32)'

  return (
    <Box sx={{ mb: '40px' }}>
      <Box
        sx={{
          ...styles.field,
          borderBottom:
            type === 'input' || type === 'textarea' ? '1px solid' : 'none',
          borderColor: color,
          '&:hover': {
            borderColor:
              invalidTwitter || invalidGithub
                ? '#fd8a45'
                : error
                ? '#ED4A6D'
                : 'white',
          },
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
              <MultiSelect
                setValue={setValue}
                title={title}
                type="categories"
                items={categories}
                selectedItems={selectedItems}
              >
                <p
                  sx={{
                    color: 'white',
                    opacity: 0.64,
                    variant: 'text.large',
                  }}
                >
                  <span>Select all categories that apply</span>
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
              <Select items={items} variant={variant} setValue={setValue} />
            )
          ) : type === 'upload' ? (
            <UploadImage setParentImage={setImage} parentImage={image} />
          ) : (
            <label sx={styles.toggle}>
              <input
                type="checkbox"
                onChange={e => {
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
      {(error || invalidTwitter || invalidGithub) && (
        <p
          sx={{
            variant: 'text.smaller',
            color: error ? 'error' : color,
            pt: 2,
          }}
        >
          {error || 'Please enter a valid username.'}
        </p>
      )}
    </Box>
  )
}

const styles = {
  field: {
    width: '100%',
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
      borderColor: 'white !important',
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
      transform: 'translateX(14px)',
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
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
    '&:before': {
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
  placeholder: PropTypes.string,
  value: PropTypes.any,
  setValue: PropTypes.func,
  image: PropTypes.string,
  setImage: PropTypes.func,
  variant: PropTypes.string,
  categories: PropTypes.any,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      parent: PropTypes.any,
    }),
  ),
  error: PropTypes.string,
}

export default Field
