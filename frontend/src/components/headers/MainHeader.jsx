import React from 'react'
import { IoMdArrowDropdown } from "react-icons/io";

function MainHeader() {
  return (
    <div className="flex items-center justify-between bg-theme-main h-16 px-24">
      <div className="flex gap-4 items-center">
        <img src="../../public/help!nvest_logo.png" alt="" className="h-8" />
        <div className="flex gap-2 text-theme-accent">
          <p>Dashboard</p>
          <p className="text-xs text-theme-accent">|</p>
          <p>Épargne</p>
          <p className="text-xs text-theme-accent">|</p>
          <p>Immobilier</p>
          <p className="text-xs text-theme-accent">|</p>
          <p>Actions</p>
          <p className="text-xs text-theme-accent">|</p>
          <p>Autres</p>
        </div>
      </div>
      <div className="flex gap-2">
        <h3 className="text-theme-accent">Mon compte</h3>
        <IoMdArrowDropdown className="size-6 text-theme-accent" />
      </div>
    </div>
  )
}

export default MainHeader