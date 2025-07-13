import React from 'react'
import Footer from './Footer'

function Layout({ header, children }) {
  return (
    <div className='min-h-screen bg-theme-bg-main flex flex-col'>
      {header}
      <main className='flex-1 px-24 pt-16'>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
