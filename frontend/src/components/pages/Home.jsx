import React from 'react'
import Layout from '../layout/Layout'
import IndexHeader from '../../components/headers/IndexHeader'

function Home() {
  return (
    <Layout header={<IndexHeader />}>
      <div className="card max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Welcome to HelpInvest
        </h2>
        <p className="text-body mb-6">
          Your professional portfolio management tool
        </p>
        
        {/* Sample Financial Data */}
        <div className="bg-theme-bg-sections rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Portfolio Value
          </h3>
          <p className="text-data text-3xl font-bold">
            €125,450.00
          </p>
        </div>

        {/* Sample Buttons */}
        <div className="flex gap-4 mb-6">
          <button className="cursor-pointer btn-primary">
            View Portfolio
          </button>
          <button className="cursor-pointer btn-secondary">
            Add Investment
          </button>
        </div>
      </div>
    </Layout>
  )
}

export default Home