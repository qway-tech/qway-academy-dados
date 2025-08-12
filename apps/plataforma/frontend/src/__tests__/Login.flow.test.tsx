import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/pages/Login';
import { render } from '@/test-utils/renderWithProviders';
import { redirectToGitHubLogin } from '@/lib/auth';

// Mock fino: não toca em window.location, apenas verifica se o serviço foi invocado
jest.mock('@/lib/auth', () => ({
  redirectToGitHubLogin: jest.fn(),
}));

describe('Fluxo de Login (integração leve com serviço de auth)', () => {
  it('ao clicar no botão, aciona o serviço de OAuth', async () => {
    render(<LoginPage />, { withRouter: false });

    const btn = screen.getByRole('button', { name: /entrar com github/i });
    await userEvent.click(btn);

    expect(redirectToGitHubLogin).toHaveBeenCalledTimes(1);
  });
});
