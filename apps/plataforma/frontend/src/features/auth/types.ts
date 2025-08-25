export type User = {
  /**
   * Identificador único do usuário retornado pelo back‑end.
   */
  id: string;
  /**
   * Nome completo ou nome de exibição do usuário.
   */
  name: string;
  /**
   * URL para o avatar do GitHub ou outro provedor. Opcional.
   */
  avatarUrl?: string;
  /**
   * Perfil do usuário no sistema. As opções atuais são `STUDENT` para alunos
   * e `ADMIN` para administradores. O backend incorpora esse campo no
   * payload do JWT e o expõe através do endpoint `/auth/me`. Os
   * componentes do front‑end podem utilizá‑lo para decidir se
   * determinadas rotas ou funcionalidades devem ser exibidas. Este
   * atributo é opcional para manter compatibilidade com versões
   * anteriores do backend que não retornavam o papel.
   */
  role?: 'STUDENT' | 'ADMIN';
};

export type AuthState = {
  user: User | null;
};

export type OAuthStart = {
  url: string;
  state: string;
  codeVerifier?: string;
};
