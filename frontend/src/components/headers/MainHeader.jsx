import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { RiBankFill, RiAddBoxFill } from 'react-icons/ri';
import { FaHistory, FaUser } from 'react-icons/fa';
import { IoLogOut } from 'react-icons/io5';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import HelpInvestLogo from '../HelpInvestLogo';

function MainHeader() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/connexion');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className='flex items-center justify-between bg-theme-main h-16 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24'>
        <div className='flex gap-4 items-center '>
          <div className='hidden lg:flex'>
            <Link to='/'>
              <HelpInvestLogo />
            </Link>
          </div>
          <Link to='/dashboard'>
            <RiBankFill className='size-6 md:size-5 nav-link' />
          </Link>
          <Link to='/opérations'>
            <RiAddBoxFill className='size-6 md:size-5 nav-link' />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex gap-2 text-theme-accent'>
          <Link to='/épargne'>
            <p className='nav-link'>Épargne</p>
          </Link>
          <p className='text-theme-accent'>|</p>
          <Link to='/immo'>
            <p className='nav-link'>Immo</p>
          </Link>
          <p className='text-theme-accent'>|</p>
          <Link to='/actions'>
            <p className='nav-link'>Actions</p>
          </Link>
          <p className='text-theme-accent'>|</p>
          <Link to='/autres'>
            <p className='nav-link'>Autres</p>
          </Link>
        </div>

        {/* Theme switcher */}
        <div className='text-theme-accent text-small border border-theme-accent rounded focus:outline-none p-1'>
          <ThemeSwitcher />
        </div>

        {/* Desktop Right Menu */}
        <div className='hidden md:flex gap-4'>
          <Link to='/historique'>
            <FaHistory className='size-5 nav-link' />
          </Link>
          <Link to='/profil'>
            <FaUser className='size-5 nav-link' />
          </Link>
          <IoLogOut
            onClick={handleLogout}
            className='size-5 nav-link cursor-pointer'
          />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className='md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1 cursor-pointer'
        >
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-transform duration-300 ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-opacity duration-300 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-theme-accent transition-transform duration-300 ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav
          role='navigation'
          className='md:hidden bg-theme-main border-t border-theme-accent/20'
        >
          <div className='flex flex-col px-4 py-2'>
            <Link to='/épargne' onClick={closeMenu}>
              <p className='nav-link py-1'>Épargne</p>
            </Link>
            <Link to='/immo' onClick={closeMenu}>
              <p className='nav-link py-1'>Immobilier</p>
            </Link>
            <Link to='/actions' onClick={closeMenu}>
              <p className='nav-link py-1'>Actions</p>
            </Link>
            <Link to='/autres' onClick={closeMenu}>
              <p className='nav-link py-1'>Autres</p>
            </Link>
            <div className='border-t border-theme-accent/20 my-2'></div>
            <Link to='/historique' onClick={closeMenu}>
              <p className='nav-link py-1'>Historique</p>
            </Link>
            <Link to='/profil' onClick={closeMenu}>
              <p className='nav-link py-1'>Profil</p>
            </Link>
            <button
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
              className='nav-link cursor-pointer text-left py-1'
            >
              Déconnexion
            </button>
          </div>
        </nav>
      )}
    </>
  );
}

export default MainHeader;
