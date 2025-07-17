import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function RiskCard() {
  const profiles = ['prudent', 'équilibré', 'dynamique']

  const [riskProfile, setRiskProfile] = useState('')
  const [currentRiskProfile, setCurrentRiskProfile] = useState('')
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskError, setRiskError] = useState('')
  const navigate = useNavigate()

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

  return (
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
            <p className='text-center'>Modifiez votre profil de risque :</p>
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
  )
}

export default RiskCard
