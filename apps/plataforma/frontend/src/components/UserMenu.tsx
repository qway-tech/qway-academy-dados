// src/components/UserMenu.tsx
import { useEffect, useState } from 'react';

export default function UserMenu() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('qats-user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('qats-token');
    localStorage.removeItem('qats-user');
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <div className="relative group">
      <button className="hover:text-gray-300">{user.name}</button>
      <div className="absolute hidden group-hover:block right-0 mt-2 bg-white text-black rounded shadow-md z-10 min-w-[120px]">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
