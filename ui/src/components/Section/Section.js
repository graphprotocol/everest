/** @jsx jsx */
import { jsx, Styled, Box } from 'theme-ui'
import PropTypes from 'prop-types'

import { Grid } from '@theme-ui/components'
import Card from '../Card'
import Link from '../Link'
import Arrow from '../../images/arrow.svg'

const Section = ({ title, description, items, to, linkText, variant }) => {
  return (
    <Grid mt={[3, 3, 7]} mb={[3, 3, 7]}>
      <Box sx={{ width: '100%' }}>
        <Styled.h3 sx={{ color: 'primary' }}>{title}</Styled.h3>
        <Styled.p>{description}</Styled.p>
      </Box>
      <Grid columns={variant === 'category' ? [1, 2, 4] : [2, 3, 6]} gap={1}>
        {items.map(item => (
          <Card
            title={item.name}
            description={item.description}
            variant={variant}
          />
        ))}
      </Grid>
      <Link to={to}>
        {linkText}
        <Arrow sx={{ verticalAlign: 'middle', marginLeft: 2 }} />
      </Link>
    </Grid>
  )
}

Section.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  items: PropTypes.any,
  to: PropTypes.string,
  linkText: PropTypes.string,
  variant: PropTypes.string
}

export default Section
