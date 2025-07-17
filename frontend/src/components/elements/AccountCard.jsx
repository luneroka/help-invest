import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'

function AccountCard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmation: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()

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

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Veuillez entrer votre mot de passe')
      return
    }

    setDeleteLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/delete-account`,
        { password: deletePassword },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )

      if (response.data.success) {
        navigate('/')
      }
    } catch (error) {
      console.error('Account delete error:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('Erreur lors de la suppression')
      }
    } finally {
      setDeleteLoading(false)
      setShowDeleteConfirm(false)
      setDeletePassword('')
    }
  }

  return (
    <div className='flex flex-col items-center h-full'>
      <h2 className='text-center'>Gérer mon compte</h2>
      <div className='card'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          {/* Error display */}
          {error && <div className='text-red-500 text-sm mb-4'>{error}</div>}

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
              {confirmationPasswordVisibility ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type='submit' className='btn-primary' disabled={loading}>
            {loading ? 'Modification...' : 'Modifier'}
          </button>
        </form>

        <div className='flex flex-col gap-4 border-t border-red-200 pt-6'>
          <p className='font-bold'>Supprimer mon compte</p>
          <p className='text-caption'>
            Une fois votre demande de suppression soumise, vous perdrez l'accès
            à votre compte HelpInvest et toutes vos données seront supprimées.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='btn-delete w-full xl:w-1/2'
            >
              Supprimer le compte
            </button>
          ) : (
            <div className='bg-red-50 p-4 rounded-lg'>
              <p className='text-red-800 mb-4'>
                <strong>Attention :</strong> Cette action est irréversible.
                Toutes vos données seront définitivement supprimées.
              </p>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-red-700 mb-2'>
                  Confirmez avec votre mot de passe :
                </label>
                <input
                  type='password'
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className='input-field w-full'
                  placeholder='Votre mot de passe'
                />
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className='btn-delete'
                >
                  {deleteLoading
                    ? 'Suppression...'
                    : 'Confirmer la suppression'}
                </button>

                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                  }}
                  className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 cursor-pointer'
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountCard
