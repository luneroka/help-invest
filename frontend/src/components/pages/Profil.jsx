import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function Profil() {
  const profiles = ['prudent', 'équilibré', 'dynamique']

  // Local state for password visibility and values
  const [passwordVisibility, setPasswordVisibility] = useState(false)
  const [confirmationPasswordVisibility, setConfirmationPasswordVisibility] =
    useState(false)
  const [password, setPassword] = useState('')
  const [confirmationPassword, setConfirmationPassword] = useState('')

  // Toggle password view
  const togglePasswordVisibility = () => {
    setPasswordVisibility((prev) => !prev)
  }

  const toggleConfirmationPasswordVisibility = () => {
    setConfirmationPasswordVisibility((prev) => !prev)
  }

  return (
    <Layout header={<MainHeader />}>
      <div className='flex flex-col items-center min-h-full'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-6xl'>
          <div className='flex flex-col h-full'>
            <h2 className='text-center'>Profil de Risque</h2>
            <div className='card h-full'>
              <div className='flex flex-col gap-4'>
                <p className='text-body text-center'>
                  Votre profil de risque actuel :
                </p>
                <p className='text-data text-center'>PRUDENT</p>
              </div>

              <div className='flex flex-col gap-4'>
                <p className='text-body text-center'>
                  Modifiez votre profil de risque :
                </p>
                <select
                  name='riskProfile'
                  id='risk-profile'
                  className='input-field input-field:focus w-full text-center'
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

          <div className='flex flex-col h-full'>
            <h2 className='text-center'>Gérer mon compte</h2>
            <div className='card'>
              <form className='flex flex-col gap-4'>
                <label htmlFor='password' className='block text-small'>
                  Changer le mot de passe
                </label>

                {/* Current Password input */}
                <div className='relative w-full'>
                  <input
                    type='password'
                    name='current-password'
                    id='current-password'
                    placeholder='Mot de passe actuel'
                    className='input-field w-full'
                    autoComplete='current-password'
                  />
                </div>

                {/* Password input */}
                <div className='relative w-full'>
                  <input
                    type={passwordVisibility ? 'text' : 'password'}
                    name='password'
                    id='password'
                    placeholder='Mot de passe'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='input-field w-full'
                    autoComplete='current-password'
                  />
                  <button
                    type='button'
                    onClick={() => togglePasswordVisibility()}
                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                  >
                    {passwordVisibility ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Confirmation input */}
                <div className='relative w-full'>
                  <input
                    type={confirmationPasswordVisibility ? 'text' : 'password'}
                    required
                    placeholder='Confirmer le mot de passe'
                    value={confirmationPassword}
                    onChange={(e) => setConfirmationPassword(e.target.value)}
                    className='input-field w-full'
                    autoComplete='new-password'
                  />
                  <button
                    type='button'
                    onClick={() => toggleConfirmationPasswordVisibility()}
                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                  >
                    {confirmationPasswordVisibility ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>

                <button className='btn-primary'>Modifier</button>
              </form>

              <div className='flex flex-col gap-4'>
                <p className='font-bold'>Supprimer mon compte</p>
                <p className='text-caption'>
                  Une fois votre demande de suppression soumise, vous perdrez
                  l'accès à votre compte HelpInvest et toutes vos données seront
                  supprimées.
                </p>
                <button className='btn-delete w-1/2'>
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profil
