import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { render } from '@/test-utils/renderWithProviders';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import Login from '@/pages/Login';

// impede que o teste carregue o módulo real que usa import.meta.env
jest.mock('@/lib/auth', () => ({
  redirectToGitHubLogin: jest.fn(),
}));

function makeRouter() {
  return createMemoryRouter(
    [{ element: <RootLayout />, children: [{ path: '/login', element: <Login /> }] }],
    { initialEntries: ['/login'] },
  );
}

describe('Login page — a11y', () => {
  it('não possui violações básicas de acessibilidade', async () => {
    const router = makeRouter();
    const { container } = render(<RouterProvider router={router} />, { withRouter: false });
    // opcional: sanity check de render
    expect(screen.getByRole('heading', { name: /login via github/i })).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
