/** @jsx jsx */
import { useState } from 'react'
import { Styled, jsx } from 'theme-ui'
import { Grid, Box } from '@theme-ui/components'

import { ORDER_BY, ORDER_DIRECTION } from '../../utils/constants'

import Menu from '../Menu'

import SortingImg from '../../images/sorting.svg'

const Sorting = ({
  selectedOrderBy,
  setSelectedOrderBy,
  selectedOrderDirection,
  setSelectedOrderDirection,
  isSortingOpen,
  setIsSortingOpen,
}) => {
  return (
    <Menu
      items={[
        {
          text: (
            <Grid
              sx={{
                gridTemplateColumns: 'repeat(2, max-content)',
                justifyContent: 'space-between',
                py: 2,
              }}
            >
              <Styled.p sx={{ color: 'secondary' }}>
                {selectedOrderBy === ORDER_BY['Name'] && (
                  <span
                    sx={{
                      display: 'inline-block',
                      backgroundColor: 'secondary',
                      borderRadius: '50%',
                      width: '6px',
                      height: '6px',
                      mb: '2px',
                      mr: 1,
                    }}
                  />
                )}
                Name
              </Styled.p>
              <p
                sx={{
                  variant: 'text.small',
                  display: 'inline',
                  color: 'blackFaded',
                  fontWeight: 'body',
                  ml: 2,
                }}
              >
                a-z
                <img
                  src="/arrow-down.png"
                  sx={{
                    width: '8px',
                    height: 'auto',
                    ml: 1,
                    transform:
                      selectedOrderBy === ORDER_BY['Name'] &&
                      selectedOrderDirection === ORDER_DIRECTION.DESC
                        ? 'rotate(180deg)'
                        : 'none',
                  }}
                  alt="arrow-down"
                />
              </p>
            </Grid>
          ),
          handleSelect: () => {
            if (selectedOrderBy === ORDER_BY.Name) {
              setSelectedOrderDirection(
                selectedOrderDirection === ORDER_DIRECTION.ASC
                  ? ORDER_DIRECTION.DESC
                  : ORDER_DIRECTION.ASC,
              )
            } else {
              setSelectedOrderBy(ORDER_BY.Name)
            }
          },
          delay: 500,
        },
        {
          text: (
            <Grid
              sx={{
                gridTemplateColumns: 'max-content max-content',
                justifyContent: 'space-between',
                py: 2,
              }}
            >
              <Styled.p sx={{ color: 'secondary' }}>
                {selectedOrderBy === ORDER_BY['Date added'] && (
                  <span
                    sx={{
                      display: 'inline-block',
                      backgroundColor: 'secondary',
                      borderRadius: '50%',
                      width: '6px',
                      height: '6px',
                      mb: '2px',
                      mr: 1,
                    }}
                  />
                )}
                Date added
              </Styled.p>
              <p
                sx={{
                  variant: 'text.small',
                  display: 'inline',
                  color: 'blackFaded',
                  fontWeight: 'body',
                  ml: 2,
                }}
              >
                Recent
                <img
                  src="/arrow-down.png"
                  sx={{
                    width: '8px',
                    height: 'auto',
                    ml: 1,
                    transform:
                      selectedOrderBy === ORDER_BY['Date added'] &&
                      selectedOrderDirection === ORDER_DIRECTION.DESC
                        ? 'rotate(180deg)'
                        : 'none',
                  }}
                  alt="arrow-down"
                />
              </p>
            </Grid>
          ),
          handleSelect: () => {
            if (selectedOrderBy === ORDER_BY['Date added']) {
              setSelectedOrderDirection(
                selectedOrderDirection === ORDER_DIRECTION.ASC
                  ? ORDER_DIRECTION.DESC
                  : ORDER_DIRECTION.ASC,
              )
            } else {
              setSelectedOrderBy(ORDER_BY['Date added'])
            }
          },
          delay: 500,
        },
      ]}
      menuStyles={{ width: '220px', top: '40px' }}
      sx={{ justifyContent: 'flex-end' }}
      setOpen={setIsSortingOpen}
    >
      <Box
        sx={{
          borderRight: isSortingOpen ? 'none' : '1px solid',
          borderColor: 'grey',
          px: 4,
          py: 2,
          mr: 3,
          backgroundColor: isSortingOpen ? 'secondary' : 'transparent',
        }}
      >
        <SortingImg
          sx={{
            cursor: 'pointer',
            fill: isSortingOpen ? 'white' : 'secondary',
          }}
        />
      </Box>
    </Menu>
  )
}

export default Sorting
