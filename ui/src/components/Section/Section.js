/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import PropTypes from 'prop-types'

import { Grid } from '@theme-ui/components'
import Card from '../Card'
import Link from '../Link'
import Arrow from '../../images/arrow.svg'

// TODO: Add Table in here
const Section = ({ title, description, items, linkText, variant, linkTo }) => {
  return (
    <Grid mt={[3, 3, 6]} mb={[3, 3, 7]}>
      <Box sx={{ width: '100%' }}>
        {title && <Styled.h3 sx={{ color: 'primary' }}>{title}</Styled.h3>}
        {description && <Styled.p>{description}</Styled.p>}
      </Box>
      <Grid columns={[2, 3, 6]} gap={1}>
        {items.map(item => (
          <Card
            title={item.name}
            description={item.description.slice(0, 20) + '...'}
            variant={variant}
            image={item.image}
            to={item.to}
          />
        ))}
      </Grid>
      {linkText && (
        <Link to={linkTo}>
          {linkText}
          <Arrow sx={{ verticalAlign: 'middle', marginLeft: 2 }} />
        </Link>
      )}
    </Grid>
  )
}

Section.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  items: PropTypes.any,
  to: PropTypes.string,
  linkText: PropTypes.string,
  variant: PropTypes.string,
  linkTo: PropTypes.string
}

export default Section
