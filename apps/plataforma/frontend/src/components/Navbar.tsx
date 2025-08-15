import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';
import ProfileMenu from './ProfileMenu';
import logo from '@/assets/qats_logo_horizontal_amarelo.png';

export default function Navbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleMobileMenu = (event: React.MouseEvent) => {
    event.stopPropagation(); // Impede que o clique feche o menu imediatamente
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = mobileMenuRef.current;
      const toggle = toggleButtonRef.current;

      if (
        menu &&
        toggle &&
        !menu.contains(event.target as Node) &&
        !toggle.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav data-testid="navbar" className="navbar h-16 fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl px-[5%] h-full flex items-center justify-between">
          {/* Logo */}
          <div>
            <Link to="/">
              <img src={logo} alt="QATS" className="h-8 object-contain" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <ul className="flex gap-6">
              <li>
                <Link to="/" className="navbar-link">
                  Início
                </Link>
              </li>
              <li>
                <Link to="https://github.com/qway-tech/qats-brasil" className="navbar-link">
                  Repositório
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link to="/quiz" className="navbar-link">
                      Quizzes
                    </Link>
                  </li>
                  <li>
                    <Link to="/prova" className="navbar-link">
                      Provas
                    </Link>
                  </li>
                </>
              )}
            </ul>
            {!user ? (
              <Link to="/login" className="navbar-link" data-testid="navbar-login-link">
                Entrar
              </Link>
            ) : (
              <span data-testid="navbar-profile-button">
                <ProfileMenu />
              </span>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={toggleButtonRef}
            onClick={toggleMobileMenu}
            data-testid="navbar-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls="navbar-mobile-menu"
            className={`md:hidden navbar-toggle ${
              isMobileMenuOpen
                ? 'bg-navbar-toggle-active text-navbar'
                : 'bg-navbar-toggle text-navbar-toggle-active'
            }`}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          data-testid="navbar-mobile-menu"
          id="navbar-mobile-menu"
          className="md:hidden bg-navbar-overlay text-navbar px-[5%] py-4 space-y-4 pt-20"
        >
          <ul className="flex flex-col gap-4 items-end">
            <li>
              <Link to="/" className="navbar-link block" onClick={() => setIsMobileMenuOpen(false)}>
                Início
              </Link>
            </li>
            <li>
              <Link
                to="https://github.com/qway-tech/qats-brasil"
                className="navbar-link block"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Repositório
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link
                    to="/quiz"
                    className="navbar-link block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Quizzes
                  </Link>
                </li>
                <li>
                  <Link
                    to="/prova"
                    className="navbar-link block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Provas
                  </Link>
                </li>
              </>
            )}
            {!user ? (
              <li>
                <Link
                  to="/login"
                  className="navbar-link block"
                  data-testid="navbar-login-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              </li>
            ) : (
              <li>
                <ProfileMenu
                  data-testid="navbar-profile-button"
                  onNavigate={() => setIsMobileMenuOpen(false)}
                />
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}
