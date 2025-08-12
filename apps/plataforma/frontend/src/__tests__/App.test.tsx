jest.mock('@/lib/auth', () => ({
  redirectToGitHubLogin: jest.fn(),
}));

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { render } from '@/test-utils/renderWithProviders';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

// Importa o mesmo layout e páginas usados na aplicação
import RootLayout from '@/layouts/RootLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Progresso from '@/pages/Progresso';
import Prova from '@/pages/Prova';
import Quiz from '@/pages/Quiz';
import Resultado from '@/pages/Resultado';
import AuthCallback from '@/pages/Login/AuthCallback';

/**
 * Monta as rotas de teste de forma idêntica às do App,
 * mas usando createMemoryRouter para controlar a rota inicial
 * sem depender de window.history nem de um BrowserRouter real.
 */
function makeTestRouter(initialPath: string) {
  return createMemoryRouter(
    [
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
    ],
    { initialEntries: [initialPath] },
  );
}

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o componente App com a Navbar', () => {
    const router = makeTestRouter('/');
    render(<RouterProvider router={router} />, { withRouter: false });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  const cases: Array<{ path: string; testId: string }> = [
    { path: '/', testId: 'page-home' },
    { path: '/login', testId: 'page-login' },
    { path: '/progresso', testId: 'page-progresso' },
    { path: '/prova', testId: 'page-prova' },
    { path: '/quiz', testId: 'page-quiz' },
    { path: '/resultado', testId: 'page-resultado' },
    { path: '/auth/callback', testId: 'page-auth-callback' },
  ];

  it.each(cases)('renderiza a rota %s', ({ path, testId }) => {
    const router = makeTestRouter(path);
    render(<RouterProvider router={router} />, { withRouter: false });
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });
});
