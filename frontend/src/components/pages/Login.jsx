import React from 'react'
import Layout from '../layout/Layout'
import AuthHeader from '../headers/AuthHeader'

function Login() {
  return (
    <Layout header={<AuthHeader />}>
        <div>
            Login Form
        </div>
    </Layout>
  )
}

export default Login