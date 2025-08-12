// src/context/authUtils.ts

interface User {
  name: string;
  email: string;
}

export function persistLogin(token: string, user: User) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function persistLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function loadAuthState(): { token: string | null; user: User | null } {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  return { token, user };
}
