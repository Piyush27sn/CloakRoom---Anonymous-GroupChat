import React from 'react';
import "./Navbar.css";
import Logo from "../assets/Cloak.png"


export const Navbar = () => {
  return (
    <>
        <header>
        <nav aria-label="Main navigation" className="navMain">
          <img src={Logo} className='navLogo' />
          <a href="#" className="navBrand"> CloakRoom - Anonymous Group Chat <i class="bi bi-chat-dots"></i></a>
        </nav>
      </header>
    </>
  )
}
