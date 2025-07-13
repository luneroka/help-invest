import React from 'react'
import Footer from './Footer'

function Layout({ header, children }) {
  return (
    <div className='min-h-screen bg-theme-bg-main'>
        {header}
        <main className='mx-6 px-4 py-8'>
            {children}
        </main>
        <Footer />
    </div>
  )
}

export default Layout