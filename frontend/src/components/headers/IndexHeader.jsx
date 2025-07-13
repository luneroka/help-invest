import React from 'react'

function IndexHeader() {
  return (
    <div className="flex items-center justify-between bg-theme-main h-[64px] px-[96px]">
        <img src="../../public/help!nvest_logo.png" alt="" className="h-8" />
        <div className="flex gap-4">
            <h3 className="text-theme-accent">S'inscrire</h3>
            <h3 className="text-theme-accent">Se connecter</h3>
        </div>
    </div>
  )
}

export default IndexHeader