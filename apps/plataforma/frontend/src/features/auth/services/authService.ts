import type { AuthState, OAuthStart } from '../types';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api';

export async function getCurrentUser(): Promise<AuthState> {
  const res = await fetch(`${BASE_URL}/auth/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Falha ao obter usuário atual');
  return res.json();
}

export async function startGithubOAuth(): Promise<OAuthStart> {
  const res = await fetch(`${BASE_URL}/auth/login`, { credentials: 'include' });
  if (!res.ok) throw new Error('Falha ao iniciar OAuth');
  return res.json();
}

export async function finishOAuthCallback(params: {
  code: string;
  state: string;
}): Promise<AuthState> {
  const res = await fetch(
    `${BASE_URL}/auth/callback?code=${encodeURIComponent(params.code)}&state=${encodeURIComponent(params.state)}`,
    { credentials: 'include' },
  );
  if (!res.ok) throw new Error('Falha ao finalizar OAuth');
  return res.json();
}

export async function logout(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Falha ao sair');
}
