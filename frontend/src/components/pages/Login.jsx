import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Layout from '../layout/Layout'
import AuthHeader from '../headers/AuthHeader'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { authorizedRequest } from '../../utils/authorizedRequest'

function Login() {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  let navigate = useNavigate()

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

    const auth = getAuth()
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password)
      // Sync user with backend after Firebase login
      const user = auth.currentUser
      if (user) {
        await authorizedRequest({
          method: 'post',
          url: `${import.meta.env.VITE_API_BASE_URL}/api/sync-user`,
          data: {
            displayName: user.displayName || ''
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      // Firebase error messages
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) {
        setError('Email ou mot de passe incorrect.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Toggle password view
  const handleTogglePasswordView = (e) => {
    e.preventDefault()
    setIsVisible((prev) => !prev)
  }

  return (
    <Layout header={<AuthHeader />}>
      <div className='flex flex-col flex-1 items-center min-h-full min-w-[300px] xs:min-w-[500px]'>
        <h2>Connectez-vous</h2>

        <div className='card'>
          {/* Form */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
            {/* Error display */}
            {error && <div className='text-red-500 text-sm mb-4'>{error}</div>}

            {/* Email Input */}
            <div className='flex flex-col gap-2'>
              <label htmlFor='email' className='block text-small'>
                Adresse email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                placeholder='Adresse email'
                className='input-field input-field:focus w-full'
                autoComplete='email'
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Password Input */}
            <div className='flex flex-col gap-2'>
              <label htmlFor='password' className='block text-small'>
                Mot de passe
              </label>
              <div className='relative w-[100%]'>
                <input
                  type={isVisible ? 'text' : 'password'}
                  name='password'
                  id='password'
                  placeholder='Mot de passe'
                  className='input-field w-full'
                  autoComplete='current-password'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />

                {isVisible ? (
                  <button
                    type='button'
                    onClick={handleTogglePasswordView}
                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                  >
                    <FaEyeSlash />
                  </button>
                ) : (
                  <button
                    type='button'
                    onClick={handleTogglePasswordView}
                    className='cursor-pointer absolute right-3 inset-y-0 my-auto text-caption'
                  >
                    <FaEye />
                  </button>
                )}
              </div>
            </div>

            {/* Connect Button */}
            <button
              type='submit'
              className='btn-primary w-full'
              disabled={loading}
            >
              {loading ? 'Connexion' : 'Se connecter'}
            </button>
          </form>

          <hr className='border-gray-300' />

          {/* Redirect To Register */}
          <p className='text-small'>
            Pas encore de compte ?{' '}
            <span className='link-default underline link-default:hover'>
              <Link to='/inscription'>Inscrivez-vous ici</Link>
            </span>
            .
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Login
