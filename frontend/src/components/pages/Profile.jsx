import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import MainHeader from '../headers/MainHeader'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

function Profile() {
  const profiles = ['prudent', 'équilibré', 'dynamique']

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmation: ''
  })
  const [riskProfile, setRiskProfile] = useState('')
  const [currentRiskProfile, setCurrentRiskProfile] = useState('')
  const [loading, setLoading] = useState(false)
  const [riskLoading, setRiskLoading] = useState(false)
  const [error, setError] = useState('')
  const [riskError, setRiskError] = useState('')
  let navigate = useNavigate()

  // Local state for password visibility and values
  const [passwordVisibility, setPasswordVisibility] = useState(false)
  const [confirmationPasswordVisibility, setConfirmationPasswordVisibility] =
    useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Clear error on input change
    if (error) setError('')
  }

  // Fetch current risk profile on component mount
  useEffect(() => {
    fetchRiskProfile()
  }, [])

  const fetchRiskProfile = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/risk-profile`,
        {
          withCredentials: true
        }
      )

      if (response.data.success) {
        setCurrentRiskProfile(response.data.user.risk_profile)
        setRiskProfile(response.data.user.risk_profile)
      }
    } catch (err) {
      console.error('Error fetching risk profile:', err)
      if (err.response?.status === 401) {
        navigate('/connexion')
      }
    }
  }

  // Handle risk profile change
  const handleRiskProfileChange = (e) => {
    setRiskProfile(e.target.value)
    if (riskError) setRiskError('')
  }

  // Handle risk profile update
  const handleRiskProfileSubmit = async (e) => {
    e.preventDefault()
    setRiskLoading(true)
    setRiskError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/risk-profile`,
        {
          riskProfile: riskProfile
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (response.data.success) {
        setCurrentRiskProfile(response.data.user.risk_profile)
        // You could add a success message here
      }
    } catch (err) {
      console.error('Risk profile update error:', err)
      if (err.response?.status === 401) {
        navigate('/connexion')
      } else if (err.response?.data?.message) {
        setRiskError(err.response.data.message)
      } else {
        setRiskError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setRiskLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmation: formData.confirmation
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (response.data.success) {
        navigate('/connexion')
      }
    } catch (err) {
      console.error('Password change error:', err)
      if (err.response?.status === 401) {
        navigate('/connexion')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

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
          <div className='flex flex-col items-center h-full'>
            <h2 className='text-center'>Profil de Risque</h2>
            <div className='card h-full'>
              <div className='flex flex-col gap-4'>
                <p className='text-center'>Votre profil de risque actuel :</p>
                <p className='text-data text-center'>
                  {currentRiskProfile
                    ? currentRiskProfile.toUpperCase()
                    : 'CHARGEMENT...'}
                </p>
              </div>

              <form
                onSubmit={handleRiskProfileSubmit}
                className='flex flex-col gap-4'
              >
                {/* Risk profile error display */}
                {riskError && (
                  <div className='text-red-500 text-sm mb-4'>{riskError}</div>
                )}

                <div className='flex flex-col gap-4'>
                  <p className='text-center'>
                    Modifiez votre profil de risque :
                  </p>
                  <select
                    name='riskProfile'
                    id='risk-profile'
                    className='input-field input-field:focus w-full text-center'
                    value={riskProfile}
                    onChange={handleRiskProfileChange}
                    required
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

                <button
                  type='submit'
                  className='btn-primary'
                  disabled={riskLoading || !riskProfile}
                >
                  {riskLoading ? 'Mise à jour...' : 'Confirmer'}
                </button>
              </form>

              <p className='text-small italic'>
                Pour en savoir plus sur le profil de risque,{' '}
                <Link to='/risque' className='link-default link-default:hover'>
                  cliquez ici
                </Link>
                .
              </p>
            </div>
          </div>

          <div className='flex flex-col items-center h-full'>
            <h2 className='text-center'>Gérer mon compte</h2>
            <div className='card'>
              <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                {/* Error display */}
                {error && (
                  <div className='text-red-500 text-sm mb-4'>{error}</div>
                )}

                {/* Email Input */}
                <div className='flex flex-col gap-2'></div>
                <label htmlFor='current-password' className='block text-small'>
                  Changer le mot de passe
                </label>

                {/* Current Password input */}
                <div className='relative w-full'>
                  <input
                    type='password'
                    name='currentPassword'
                    id='currentPassword'
                    placeholder='Mot de passe actuel'
                    className='input-field w-full'
                    autoComplete='current-password'
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* New password input */}
                <div className='relative w-full'>
                  <input
                    type={passwordVisibility ? 'text' : 'password'}
                    name='newPassword'
                    id='newPassword'
                    placeholder='Nouveau mot de passe'
                    className='input-field w-full'
                    autoComplete='new-password'
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    required
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
                    name='confirmation'
                    id='confirmation'
                    placeholder='Confirmer le mot de passe'
                    className='input-field w-full'
                    autoComplete='new-password'
                    value={formData.confirmation}
                    onChange={handleInputChange}
                    required
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

                <button
                  type='submit'
                  className='btn-primary'
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </form>

              <div className='flex flex-col gap-4'>
                <p className='font-bold'>Supprimer mon compte</p>
                <p className='text-caption'>
                  Une fois votre demande de suppression soumise, vous perdrez
                  l'accès à votre compte HelpInvest et toutes vos données seront
                  supprimées.
                </p>
                <button className='btn-delete w-full xl:w-1/2'>
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

export default Profile
