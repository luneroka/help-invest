import React from 'react';
import { Link } from 'react-router-dom';

function AuthHeader() {
  return (
    <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
      <Link to='/'>
        <img
          src='../../public/help!nvest_logo.png'
          alt='HelpInvest'
          className='h-6'
        />
      </Link>
    </div>
  );
}

export default AuthHeader;
