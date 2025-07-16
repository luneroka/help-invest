import React from 'react'
import Footer from './Footer'

function Layout({ header, children }) {
  return (
    <div className='min-h-screen bg-theme-bg-main flex flex-col'>
      {header}
      <main className='flex-1 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16'>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
