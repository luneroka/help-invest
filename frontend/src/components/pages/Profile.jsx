import React from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import RiskCard from '../elements/RiskCard'
import AccountCard from '../elements/AccountCard'

function Profile() {
  return (
    <Layout header={<MainHeader />}>
      <div className='flex flex-col items-center min-h-full'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-6xl'>
          <RiskCard />
          <AccountCard />
        </div>
      </div>
    </Layout>
  )
}

export default Profile
