/** @jsx jsx */
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'

const Loading = ({ variant, ...props }) => {
  const [imagePrefix, setImagePrefix] = useState('')

  useEffect(() => {
    if (typeof window !== undefined) {
      setImagePrefix(window.__GATSBY_IPFS_PATH_PREFIX__ || '')
    }
  }, [])

  return (
    <img
      src={`${imagePrefix}/loading-dots-${variant}.gif`}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        margin: '0 auto',
      }}
      {...props}
    />
  )
}

Loading.propTypes = {
  variant: PropTypes.string,
  props: PropTypes.any,
}

export default Loading
