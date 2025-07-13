import React from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'

function Dashboard() {
  return (
    <Layout header={<MainHeader />}>
      <div>
        Dashboard
      </div>
    </Layout>
  )
}

export default Dashboard