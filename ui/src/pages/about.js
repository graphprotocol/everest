import React from 'react'
import Layout from '../components/Layout'
import styled from 'styled-components'

const Container = styled.div`
  display: grid;
  justify-content: center;
  align-iterms: center;
  min-height: 100vh;
`

const About = ({ data }) => {
  return (
    <Layout>
      <Container>
        <p>Everest is the greatest project ever.</p>
      </Container>
    </Layout>
  )
}

export default About
