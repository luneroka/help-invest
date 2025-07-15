import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Layout from '../layout/Layout'
import AuthHeader from '../headers/AuthHeader'
import axios from 'axios'

function Login() {
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        `${import.meta.env.VITE_API_BASE_URL}/api/login`, // This will use http://localhost:5000
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )

      if (response.data.success) {
        console.log('Login successful:', response.data)
        // Redirect to dashboard or home page
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
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
              <label htmlFor='username' className='block text-small'>
                Nom d'utilisateur
              </label>
              <input
                type='text'
                name='username'
                id='username'
                placeholder="Nom d'utilisateur"
                className='input-field input-field:focus w-full'
                autoComplete='username'
                value={formData.username}
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
