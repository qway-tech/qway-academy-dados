import { useAuth } from '@/context/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
  onNavigate?: () => void;
}

export default function ProfileMenu({ onNavigate }: ProfileMenuProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="navbar-link">
        Entrar
      </Link>
    );
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    onNavigate?.();
    navigate('/');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button ref={buttonRef} onClick={() => setIsOpen((prev) => !prev)} className="btn-profile">
        <span>{user?.name || 'Perfil'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 dropdown rounded shadow-md z-50 text-sm">
          <div className="px-4 py-2 border-dropdown-separator">
            <span className="font-medium">{user?.name}</span>
            <br />
            <span className="text-xs">{user?.email}</span>
          </div>

          <div>
            <Link
              to="/progresso"
              className="profile-menu-link"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
            >
              Meu Progresso
            </Link>
          </div>

          <div>
            <Link to="/" onClick={handleLogout} className="profile-menu-link text-logout">
              Sair
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
