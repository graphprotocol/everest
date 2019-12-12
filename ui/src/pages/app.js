import React from 'react'
import { Router } from '@reach/router'
import Layout from '../components/Layout'
import Project from './Project'

const App = props => {
  console.log('PROPS: ', props)
  return (
    <Layout>
      <Router>
        <Project exact path="/project/*" />
      </Router>
    </Layout>
  )
}
export default App
