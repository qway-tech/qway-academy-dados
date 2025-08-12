// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// IMPORTANDO AS PÁGINAS
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Progresso from '@/pages/Progresso';
import Prova from '@/pages/Prova';
import Quiz from '@/pages/Quiz';
import Resultado from './pages/Resultado';
import AuthCallback from '@/pages/Login/AuthCallback';
import RootLayout from '@/layouts/RootLayout';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/progresso', element: <Progresso /> },
      { path: '/prova', element: <Prova /> },
      { path: '/quiz', element: <Quiz /> },
      { path: '/resultado', element: <Resultado /> },
      { path: '/auth/callback', element: <AuthCallback /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
