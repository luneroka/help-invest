import { Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { PiPiggyBank } from 'react-icons/pi'
import { FiExternalLink } from 'react-icons/fi'

function Dashboard() {
  return (
    <Layout header={<MainHeader />}>
      <h2>
        Patrimoine total : <span>insert value €</span>
      </h2>
      <div className='flex gap-8 justify-between'>
        <div className='border w-full h-[450px]'>Graph card</div>
        <div className='w-full'>
          <div className='border h-full mb-16'>Recommendation card</div>
          <div className='flex gap-4'>
            <Link to='/opérations' className='flex-1'>
              <button className='btn-secondary gap-2 w-full btn-secondary:hover'>
                Investir
                <PiPiggyBank />
              </button>
            </Link>
            <Link to='/risque' className='flex-1'>
              <button className='btn-secondary gap-2 w-full btn-secondary:hover'>
                Profil de Risque
                <FiExternalLink />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
