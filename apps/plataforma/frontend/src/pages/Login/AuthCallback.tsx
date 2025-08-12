import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const alreadyCalledRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code || !state) return;
    if (alreadyCalledRef.current) return;
    alreadyCalledRef.current = true;

    fetch('http://localhost:4000/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          login(data.access_token, data.user);
          window.history.replaceState({}, '', '/');
          navigate('/');
        } else {
          console.error('Erro ao obter token:', data);
        }
      });
  }, [login, navigate]);

  return (
    <main data-testid="page-auth-callback" className="pt-24 px-6">
      <div className="max-w-xl mx-auto p-6 text-body text-center">
        <h1 className="text-3xl font-bold mb-6 text-heading">Finalizando login…</h1>
        <p className="text-base">Aguarde, finalizando login...</p>
      </div>
    </main>
  );
}
