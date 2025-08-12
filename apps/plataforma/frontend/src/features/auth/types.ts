export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type AuthState = {
  user: User | null;
};

export type OAuthStart = {
  url: string;
  state: string;
  codeVerifier?: string;
};
