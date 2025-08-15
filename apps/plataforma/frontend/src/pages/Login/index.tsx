import { redirectToGitHubLogin } from '@/lib/auth';

export default function Login() {
  return (
    <section
      data-testid="page-login"
      className="max-w-xl mx-auto p-6 text-body text-center"
      aria-labelledby="login-title"
    >
      <h1 id="login-title" className="text-3xl font-bold mb-6 text-heading">
        Login via GitHub
      </h1>

      <p className="mb-4 text-base">
        Para acessar os recursos do{' '}
        <strong>
          QATS
        </strong>
        , como{' '}
        <strong>
          realizar o Quiz de cada Capítulo, a Prova de cada Módulo e acessar seus Certificados
        </strong>
        , você precisará realizar autenticação com sua conta GitHub.
      </p>

      <button onClick={() => redirectToGitHubLogin()} className="btn-login">
        Entrar com GitHub
      </button>
    </section>
  );
}
