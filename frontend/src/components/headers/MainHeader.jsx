import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { Link } from 'react-router-dom'

function MainHeader() {
  let navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/logout`,
        {},
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
    } catch (error) {
      console.error('Logout error', error)
    }
  }

  return (
    <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
      <div className='flex gap-4 items-center'>
        <Link to='/'>
          <img
            src='../../public/help!nvest_logo.png'
            alt='HelpInvest'
            className='h-8'
          />
        </Link>
        <div className='flex gap-2 text-theme-accent'>
          <Link to='/dashboard'>
            <p className='nav-link nav-link:hover'>Dashboard</p>
          </Link>
          <p>|</p>
          <Link to='/opérations'>
            <p className='nav-link nav-link:hover'>Opérations</p>
          </Link>
          <p>|</p>
          <Link to='/historique'>
            <p className='nav-link nav-link:hover'>Historique</p>
          </Link>
        </div>
      </div>
      <div className='flex gap-4'>
        <Link to='/profil'>
          <p className='nav-link nav-link:hover'>Profil</p>
        </Link>
        <button
          onClick={handleLogout}
          className='nav-link nav-link:hover cursor-pointer'
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}

export default MainHeader
