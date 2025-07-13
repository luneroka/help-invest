import React from 'react'
import { IoMdArrowDropdown } from "react-icons/io";

function MainHeader() {
  return (
    <div className="flex items-center justify-between bg-theme-main h-[64px] px-[96px]">
      <div className="flex gap-[16px] items-center">
        <img src="../../public/help!nvest_logo.png" alt="" className="h-8" />
        <div className="flex gap-[8px] text-theme-accent">
          <p>Dashboard</p>
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
        <IoMdArrowDropdown className="size-[24px] text-theme-accent" />
      </div>
    </div>
  )
}

export default MainHeader