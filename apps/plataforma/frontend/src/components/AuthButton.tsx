// src/components/AuthButton.tsx
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    console.log('Logout realizado');
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fecha o menu se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative user-menu">
      <button
        onClick={toggleMenu}
        className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 text-sm"
      >
        Perfil ▾
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg z-10">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
