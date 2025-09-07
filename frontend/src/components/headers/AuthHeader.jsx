import React from 'react';
import { Link } from 'react-router-dom';
import HelpInvestLogo from '../HelpInvestLogo';

function AuthHeader() {
  return (
    <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
      <Link to='/'>
        <HelpInvestLogo />
      </Link>
    </div>
  );
}

export default AuthHeader;
