/** @jsx jsx */
import { useState, useLayoutEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import { jsx, Styled, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Card from '../Card'
import Link from '../Link'
import Row from '../Row'
import Arrow from '../../images/arrow.svg'

const Section = ({
  title,
  description,
  items,
  linkText,
  variant,
  linkTo,
  selected,
}) => {
  const [size, setSize] = useState([0, 0])

  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  if (selected === 'table' && size[0] > 830) {
    return (
      <Fragment>
        {items.length > 0 && (
          <Grid
            gap={1}
            mt={8}
            sx={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}
          >
            {['Name', 'Category', 'Date Added', 'Reputation', 'Challenged'].map(
              entry => (
                <p
                  sx={{
                    textAlign: 'left',
                    color: 'column',
                    variant: 'text.small',
                    fontWeight: 'bold',
                    '&:first-of-type': {
                      pl: 9,
                    },
                  }}
                >
                  {entry}
                </p>
              ),
            )}
          </Grid>
        )}
        {items.map(item => (
          <Row item={item} />
        ))}
      </Fragment>
    )
  } else {
    return (
      <Grid mt={title ? [3, 3, 8] : 0} mb={title ? [3, 3, 7] : 0}>
        <Box sx={{ width: '100%' }}>
          {title && (
            <Styled.h3 sx={{ color: 'primary', mb: 1 }}>{title}</Styled.h3>
          )}
          {description && (
            <Styled.p sx={{ maxWidth: '50%', mb: 4 }}>{description}</Styled.p>
          )}
        </Box>
        <Grid columns={[2, 3, 6]} gap={2}>
          {items.map((item, index) => (
            <Card
              key={index}
              title={item.name}
              description={item.description}
              variant={variant}
              image={item.image}
              to={item.to}
              category={item.category}
            />
          ))}
        </Grid>
        {linkText && (
          <Link to={linkTo}>
            {linkText}
            <Arrow
              sx={{
                verticalAlign: 'middle',
                marginLeft: 2,
                fill: 'secondary',
                transition: 'all 0.3s ease',
              }}
            />
          </Link>
        )}
      </Grid>
    )
  }
}

Section.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  items: PropTypes.any,
  to: PropTypes.string,
  linkText: PropTypes.string,
  variant: PropTypes.string,
  linkTo: PropTypes.string,
  selected: PropTypes.string,
}

export default Section
