import React from 'react'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { PiPiggyBank } from 'react-icons/pi'
import { FiExternalLink } from 'react-icons/fi'

function Dashboard() {
  return (
    <Layout header={<MainHeader />}>
      <div>
        <h2>
          Patrimoine total : <span>insert value €</span>
        </h2>
        <div className='flex gap-8 justify-between'>
          <div className='border w-full h-[450px]'>Graph card</div>
          <div className='w-full'>
            <div className='border h-full mb-16'>Recommendation card</div>
            <div className='flex gap-4'>
              <button className='btn-secondary flex-1 gap-2 btn-secondary:hover'>
                Investir
                <PiPiggyBank />
              </button>
              <button className='btn-secondary flex-1 gap-2 btn-secondary:hover'>
                Profil de Risque
                <FiExternalLink />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
