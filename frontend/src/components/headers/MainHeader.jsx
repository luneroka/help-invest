import React from 'react'
import { Link } from 'react-router-dom'

function MainHeader() {
  return (
    <div className='flex items-center justify-between bg-theme-main h-16 px-24'>
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
        <Link to='/logout'>
          <p className='nav-link nav-link:hover'>Déconnexion</p>
        </Link>
      </div>
    </div>
  )
}

export default MainHeader
