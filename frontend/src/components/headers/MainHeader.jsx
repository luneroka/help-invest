import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function MainHeader() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
        <div className='flex gap-4 items-center'>
          <Link to='/'>
            <img
              src='../../public/help!nvest_logo.png'
              alt='HelpInvest'
              className='h-8'
            />
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex gap-2 text-theme-accent'>
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

        {/* Desktop Right Menu */}
        <div className='hidden md:flex gap-4'>
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className='md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1'
        >
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-transform duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-transform duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-theme-main border-t border-theme-accent/20'>
          <div className='flex flex-col px-4 py-2'>
            <Link to='/dashboard' onClick={closeMenu}>
              <p className='nav-link nav-link:hover py-1'>Dashboard</p>
            </Link>
            <Link to='/opérations' onClick={closeMenu}>
              <p className='nav-link nav-link:hover py-1'>Opérations</p>
            </Link>
            <Link to='/historique' onClick={closeMenu}>
              <p className='nav-link nav-link:hover py-1'>Historique</p>
            </Link>
            <div className='border-t border-theme-accent/20 my-2'></div>
            <Link to='/profil' onClick={closeMenu}>
              <p className='nav-link nav-link:hover py-1'>Profil</p>
            </Link>
            <button
              onClick={() => {
                handleLogout()
                closeMenu()
              }}
              className='nav-link nav-link:hover cursor-pointer text-left py-1'
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MainHeader
