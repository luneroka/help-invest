import { Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { PiPiggyBank } from 'react-icons/pi'
import { FiExternalLink } from 'react-icons/fi'
import DashTable from '../elements/DashTable'
import DashGraph from '../elements/DashGraph'

function Dashboard() {
  return (
    <Layout header={<MainHeader />}>
      <h2>Répartition du Patrimoine</h2>
      <div className='flex gap-16 justify-between'>
        <div className='w-full'>
          <div className='h-full mb-16'>
            <DashGraph />
          </div>
        </div>
        <div className='w-full'>
          <DashTable />
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
