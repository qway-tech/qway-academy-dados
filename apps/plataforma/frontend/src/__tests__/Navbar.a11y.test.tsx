import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import { render } from '@/test-utils/renderWithProviders';
import Navbar from '@/components/Navbar';

describe('Navbar - acessibilidade', () => {
  it('não possui violações básicas de acessibilidade', async () => {
    const { container } = render(<Navbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
