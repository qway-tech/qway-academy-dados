// 📁 lib/auth.ts
export function generateRandomState(): string {
  return [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function redirectToGitHubLogin(state?: string) {
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = 'http://localhost:5173/auth/callback';

  const generatedState = state || generateRandomState();
  sessionStorage.setItem('oauth_state', generatedState);

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&state=${generatedState}`;
  window.location.assign(githubAuthUrl);
}

export function handleLogout() {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('oauth_state');
  window.location.assign('/');
}
