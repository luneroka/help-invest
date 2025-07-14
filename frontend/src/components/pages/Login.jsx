import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Layout from '../layout/Layout'
import AuthHeader from '../headers/AuthHeader'

function Login() {
  const [isVisible, setIsVisible] = useState(false)

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
          <form className='flex flex-col gap-8'>
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
            <button type='submit' className='btn-primary w-full'>
              Se connecter
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
