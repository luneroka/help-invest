import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'

function Profil() {
  const profiles = ['prudent', 'équilibré', 'dynamique']

  return (
    <Layout header={<MainHeader />}>
      <div className='flex flex-col items-center min-h-full'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl'>
          <div>
            <h2>Profil de Risque</h2>
            <div className='card'>
              <div className='flex flex-col gap-4'>
                <p className='text-h3-light'>
                  Votre profil de risque actuel est paramétré sur :
                </p>
                <p className='text-data text-center'>PRUDENT</p>
              </div>

              <div className='flex flex-col gap-4'>
                <p className='text-h3-light'>
                  Modifiez votre profil de risque ci-desous :
                </p>
                <select
                  name='riskPofile'
                  id='risk-profile'
                  className='input-field input-field:focus w-full'
                >
                  <option value='' disabled>
                    Sélectionner une option
                  </option>
                  {profiles.map((profile) => (
                    <option key={`${profile}-key`} value={profile}>
                      {profile.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <button className='btn-primary'>Confirmer</button>

              <p className='text-small italic'>
                Pour en savoir plus sur le profil de risque,{' '}
                <Link to='/risque' className='link-default link-default:hover'>
                  cliquez ici
                </Link>
                .
              </p>
            </div>
          </div>

          <div>
            <h2>Gérer mon compte</h2>
            <div className='card'></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profil
