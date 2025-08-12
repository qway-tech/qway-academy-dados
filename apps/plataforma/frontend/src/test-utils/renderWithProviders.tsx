import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import type { ReactElement, ReactNode } from 'react';
import type { RenderOptions } from '@testing-library/react';

// Opções extras para facilitar testes com rotas
export type ExtraRenderOptions = {
  /** Rota(s) inicial(is) para o MemoryRouter. Ex: '/login' */
  route?: string | string[];
  /** Props adicionais do MemoryRouter (history index, etc) */
  routerProps?: Omit<MemoryRouterProps, 'children' | 'initialEntries'>;
  /**
   * Quando `true` (padrão), envolve em um MemoryRouter.
   * Use `false` quando o componente já estiver dentro de um Router no teste.
   */
  withRouter?: boolean;
};

export type Options = Omit<RenderOptions, 'wrapper'> & ExtraRenderOptions;

export function render(ui: ReactElement, options?: Options) {
  const { route = '/', routerProps, withRouter = true, ...rtlOpts } = options ?? {};
  const initialEntries = Array.isArray(route) ? route : [route];

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const routed = withRouter ? (
      <MemoryRouter initialEntries={initialEntries} {...routerProps}>
        {children}
      </MemoryRouter>
    ) : (
      children
    );
    return <AuthProvider>{routed}</AuthProvider>;
  };

  return rtlRender(ui, {
    wrapper: Wrapper,
    ...rtlOpts,
  });
}

// Reexporta tudo do RTL para uso direto nos testes
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
// E também o userEvent centralizado aqui
export { default as userEvent } from '@testing-library/user-event';
