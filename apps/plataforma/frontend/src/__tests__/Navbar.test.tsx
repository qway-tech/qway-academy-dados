import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

import { render } from '@/test-utils/renderWithProviders';

// Mock controlável do hook useAuth para evitar depender de opções extras no render
// Cada teste pode mudar `mockAuth.user` para simular estados logado/deslogado

type MockAuth = { user: null | { id: string; name: string; avatarUrl?: string } };
const mockAuth: MockAuth = { user: null };

jest.mock('@/context/useAuth', () => {
  const actual = jest.requireActual('@/context/useAuth');
  return {
    ...actual,
    useAuth: () => mockAuth,
  };
});

import Navbar from '@/components/Navbar';
describe('Navbar', () => {
  beforeEach(() => {
    // Estado padrão: deslogado
    mockAuth.user = null;
  });

  it('mostra link "Entrar" quando usuário está deslogado', () => {
    mockAuth.user = null;
    render(<Navbar />);

    expect(screen.getByTestId('navbar-login-link')).toBeInTheDocument();
    expect(screen.getByTestId('navbar-login-link')).toHaveAttribute('href', '/login');
    expect(screen.queryByTestId('navbar-profile-button')).toBeNull();
  });

  it('mostra botão de perfil quando usuário está logado', () => {
    mockAuth.user = { id: 'u1', name: 'QWay', avatarUrl: 'https://example.com/a.png' };
    render(<Navbar />);

    expect(screen.getByTestId('navbar-profile-button')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-login-link')).toBeNull();
  });

  it('exibe links principais com os hrefs corretos', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /início/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /repositório/i })).toHaveAttribute(
      'href',
      'https://github.com/qway-tech/qats-brasil',
    );
  });

  it('abre menu mobile ao clicar no toggle (ou atualiza estado visual)', async () => {
    mockAuth.user = null;
    const user = userEvent.setup();
    render(<Navbar />);

    const toggle = screen.getByTestId('navbar-toggle');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('navbar-mobile-menu')).toBeInTheDocument();
  });
});
