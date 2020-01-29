/** @jsx jsx */
import { Styled, jsx } from 'theme-ui'
import styled from 'styled-components'

const Container = styled.div`
  display: grid;
  justify-content: center;
  align-iterms: center;
  min-height: 100vh;
`

const Error = ({ data }) => {
  return (
    <Container>
      <Styled.p>Page not found.</Styled.p>
    </Container>
  )
}

export default Error
