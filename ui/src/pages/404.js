/** @jsx jsx */
import { Styled, jsx } from 'theme-ui'
import Layout from '../components/Layout'
import styled from 'styled-components'

const Container = styled.div`
  display: grid;
  justify-content: center;
  align-iterms: center;
  min-height: 100vh;
`

const Error = ({ data }) => {
  return (
    <Layout>
      <Container>
        <Styled.p>Page not found.</Styled.p>
      </Container>
    </Layout>
  )
}

export default Error
