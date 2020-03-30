/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx, Box } from 'theme-ui'
import { Grid } from '@theme-ui/components'
import { useQuery } from '@apollo/react-hooks'

import { CATEGORIES_QUERY } from '../utils/apollo/queries'
import { CATEGORIES_ORDER_BY, ORDER_DIRECTION } from '../utils/constants'

import Section from '../components/Section'
import Sorting from '../components/Sorting'

const Categories = () => {
  const [selectedOrderBy, setSelectedOrderBy] = useState(
    CATEGORIES_ORDER_BY['Name'],
  )
  const [selectedOrderDirection, setSelectedOrderDirection] = useState(
    ORDER_DIRECTION.ASC,
  )
  const [isSortingOpen, setIsSortingOpen] = useState(false)

  const { loading, data, error } = useQuery(CATEGORIES_QUERY, {
    variables: {
      parentCategory: null,
      orderDirection: selectedOrderDirection,
      orderBy: selectedOrderBy,
    },
  })

  if (error) {
    console.error('Error getting categories: ', error)
    return <div />
  }

  return (
    <Box>
      <Box>
        <Grid
          sx={{
            gridTemplateColumns: '1fr max-content',
            alignItems: 'baseline',
          }}
        >
          <Styled.h2>Categories</Styled.h2>
          <Sorting
            selectedOrderBy={selectedOrderBy}
            setSelectedOrderBy={setSelectedOrderBy}
            selectedOrderDirection={selectedOrderDirection}
            setSelectedOrderDirection={setSelectedOrderDirection}
            isSortingOpen={isSortingOpen}
            setIsSortingOpen={setIsSortingOpen}
            orderBy={CATEGORIES_ORDER_BY}
          />
        </Grid>
        <Styled.p sx={{ opacity: 0.64, color: 'rgba(9,6,16,0.5)' }}>
          {data && data.categories.length} Categories
        </Styled.p>
      </Box>
      {loading && !data && (
        <img
          src="/loading-dots-blue.gif"
          sx={{ position: 'absolute', left: 0, right: 0, margin: '0 auto' }}
        />
      )}
      {data && (
        <Section
          items={data.categories.map(cat => {
            return {
              name: cat.name,
              description: `${cat.projectCount} PROJECTS`,
              image: cat.imageUrl,
              to: `/category/${cat.id}`,
            }
          })}
          variant="category"
        />
      )}
    </Box>
  )
}

export default Categories
