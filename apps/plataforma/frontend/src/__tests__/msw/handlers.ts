import { http, HttpResponse, delay } from 'msw';

const SESSION: { user: { id: string; name: string; avatarUrl?: string } | null } = {
  user: null,
};

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true })),

  http.get('/api/auth/me', async () => {
    await delay(30);
    return HttpResponse.json({ user: SESSION.user });
  }),

  http.get('/api/auth/login', () => {
    return HttpResponse.json({
      url: 'https://github.com/login/oauth/authorize?client_id=fake&state=fake-state',
      state: 'fake-state',
    });
  }),

  http.get('/api/auth/callback', ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state) {
      return new HttpResponse('Missing code/state', { status: 400 });
    }
    SESSION.user = { id: '1', name: 'QWay' };
    return HttpResponse.json({ user: SESSION.user });
  }),

  http.post('/api/auth/logout', async () => {
    await delay(20);
    SESSION.user = null;
    return new HttpResponse(null, { status: 204 });
  }),
];

// helpers para testes que precisem forçar estado
export const __setLoggedIn = (name = 'QWay') => (SESSION.user = { id: '1', name });
export const __setLoggedOut = () => (SESSION.user = null);
