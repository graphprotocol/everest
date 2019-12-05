/** @jsx jsx */
import React from 'react'
import PropTypes from 'prop-types'

import { graphql } from 'gatsby'
import { Styled, jsx } from 'theme-ui'
import Layout from '../components/Layout'
import styled from 'styled-components'

const Container = styled.div`
  display: grid;
  justify-content: center;
  align-iterms: center;
  min-height: 100vh;
`

const Categories = ({ data }) => {
  return (
    <Layout>
      <Container>
        <Styled.p>Everest is the greatest project ever.</Styled.p>
      </Container>
    </Layout>
  )
}

export default Categories
