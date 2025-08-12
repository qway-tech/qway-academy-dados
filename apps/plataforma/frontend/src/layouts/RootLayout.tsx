import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar fixa no topo */}
      <Navbar />

      {/* Conteúdo principal */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer opcional futuro */}
    </div>
  );
}
