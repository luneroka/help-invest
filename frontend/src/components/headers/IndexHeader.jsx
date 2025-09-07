import React from 'react';
import { Link } from 'react-router-dom';
import HelpInvestLogo from '../HelpInvestLogo';

function IndexHeader() {
  return (
    <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
      <Link to='/'>
        <HelpInvestLogo />
      </Link>
      <div className='flex gap-4'>
        <Link to='/inscription'>
          <h3 className='nav-link'>S'inscrire</h3>
        </Link>
        <Link to='/connexion'>
          <h3 className='nav-link'>Se connecter</h3>
        </Link>
      </div>
    </div>
  );
}

export default IndexHeader;
