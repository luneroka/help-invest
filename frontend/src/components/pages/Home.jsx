import React from 'react'
import Layout from '../layout/Layout'
import IndexHeader from '../../components/headers/IndexHeader'

function Home() {
  return (
    <Layout header={<IndexHeader />}>
      <div className="p-16 flex">
        <div className="flex flex-col gap-4">
          <h1>Bienvenue sur HelpInvest !</h1>

        </div>
      </div>
    </Layout>
  )
}

export default Home