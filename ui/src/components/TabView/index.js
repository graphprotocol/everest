/** @jsx jsx */
import PropTypes from 'prop-types'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import Field from '../Field'
import Button from '../Button'

const TabView = ({
  description,
  fieldType,
  charsCount,
  title,
  header,
  placeholder,
  heading,
  value,
  setValue,
  text,
  icon,
  handleClick,
  showFilters,
  items,
  error,
  ...props
}) => {
  return (
    <Grid
      sx={{
        backgroundColor: 'secondary',
        position: 'absolute',
        zIndex: 10,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 120px)',
      }}
      {...props}
    >
      <Grid
        sx={{
          gridTemplateColumns: ['1fr', '380px 1fr'],
          position: 'relative',
          maxWidth: '1260px',
          padding: '0 20px',
          margin: '0 auto',
          width: '100%',
          my: 8,
        }}
        gap={[1, 8]}
      >
        <Box>
          <Styled.h1
            sx={{
              color: 'white',
              mb: 3,
              hyphens: 'manual',
              overflowWrap: 'break-word',
            }}
          >
            {heading}
          </Styled.h1>
          <p sx={{ variant: 'text.field' }}>{description}</p>
        </Box>
        <Box sx={{ maxWidth: '516px', width: '100%', mt: [5, 0], pt: 5 }}>
          {header && <Styled.h4 sx={{ color: 'white' }}>{header}</Styled.h4>}
          {showFilters && (
            <Field
              multiselect={false}
              title="Challenge on behalf of"
              type="filters"
              variant="project"
              setValue={async value => {
                await setValue('projectId', value)
              }}
              items={items}
            />
          )}
          <Field
            title={title}
            value={value}
            type={fieldType}
            charsCount={charsCount}
            placeholder={placeholder}
            setValue={async value => {
              if (title === 'Description') {
                setValue('description', value)
              } else {
                setValue(value)
              }
            }}
            error={error}
          />
          <Button
            variant={'secondary'}
            onClick={e => {
              handleClick(e)
            }}
            text={text}
            icon={icon}
            sx={{ margin: ['auto', 'auto', 0] }}
            disabled={value.length === 0}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

TabView.propTypes = {
  projects: PropTypes.array,
  fieldType: PropTypes.string,
  description: PropTypes.any,
  charsCount: PropTypes.number,
  title: PropTypes.string,
  header: PropTypes.string,
  placeholder: PropTypes.string,
  heading: PropTypes.string,
  value: PropTypes.string,
  setValue: PropTypes.func,
  text: PropTypes.string,
  icon: PropTypes.string,
  handleClick: PropTypes.func,
  showFilters: PropTypes.bool,
  error: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.any,
      handleSelect: PropTypes.func,
      icon: PropTypes.string,
    }),
  ),
}

export default TabView
