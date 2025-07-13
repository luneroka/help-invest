import React from 'react'
import { Link } from 'react-router-dom'
import { IoMdArrowDropdown } from "react-icons/io";

function MainHeader() {
  return (
    <div className="flex items-center justify-between bg-theme-main h-16 px-24">
      <div className="flex gap-4 items-center">
        <Link to="/">
          <img src="../../public/help!nvest_logo.png" alt="HelpInvest" className="h-8" />
        </Link>
        <div className="flex gap-2 text-theme-accent">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            <p>Dashboard</p>
          </Link>
          <p>|</p>
          <p>Épargne</p>
          <p>|</p>
          <p>Immobilier</p>
          <p>|</p>
          <p>Actions</p>
          <p>|</p>
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