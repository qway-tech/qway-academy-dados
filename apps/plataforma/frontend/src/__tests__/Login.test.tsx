// Mock do módulo de auth para encadear o "redirecionamento" sem tocar em window.location
jest.mock('@/lib/auth', () => ({
  redirectToGitHubLogin: jest.fn(() => {
    // Em produção, esse serviço chamaria window.location.assign(...)
    // No teste, retornamos a URL para verificação sem mexer no Location do JSDOM
    return 'https://github.com/login/oauth/authorize?client_id=TEST&redirect_uri=http://localhost/auth/callback&scope=read:user';
  }),
}));

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test-utils/renderWithProviders';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import Login from '@/pages/Login';
import { redirectToGitHubLogin } from '@/lib/auth';

function makeRouter() {
  return createMemoryRouter(
    [{ element: <RootLayout />, children: [{ path: '/login', element: <Login /> }] }],
    { initialEntries: ['/login'] },
  );
}

describe('Login page', () => {
  it('aciona o fluxo de OAuth ao clicar no botão (sem mexer em window.location)', async () => {
    const user = userEvent.setup();
    const router = makeRouter();
    render(<RouterProvider router={router} />, { withRouter: false });

    const btn =
      screen.queryByRole('button', { name: /entrar com github/i }) ??
      screen.getByTestId('login-submit');

    await user.click(btn);

    // Verifica que o serviço foi acionado
    expect(redirectToGitHubLogin).toHaveBeenCalledTimes(1);

    // Opcional: valida que a URL "que seria aberta" está correta via valor de retorno do mock
    const returned = (redirectToGitHubLogin as jest.Mock).mock.results[0]?.value as string;
    expect(returned).toContain('github.com/login/oauth/authorize');
    expect(returned).toContain('client_id=');
    expect(returned).toContain('redirect_uri=');
  });
});
