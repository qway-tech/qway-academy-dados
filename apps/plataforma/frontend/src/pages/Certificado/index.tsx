import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { getCertificates } from '@/services/api';
import { getCurrentUser } from '@/features/auth/services/authService';

export default function Certificado() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const auth = await getCurrentUser();
        const id = auth?.user?.id;
        if (!id) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }
        const res: any = await getCertificates(id);
        setCerts(res || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar certificados');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <MainLayout>
      <div data-testid="page-certificados" className="space-y-6">
        <h1 className="text-4xl font-bold">📜 Certificados</h1>
        {loading && <p>Carregando certificados…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && certs.length === 0 && <p>Você ainda não possui certificados.</p>}
        {!loading && !error && certs.length > 0 && (
          <ul className="space-y-3">
            {certs.map((c: any) => (
              <li key={c.trail} className="border rounded p-3">
                <p className="font-semibold">Trilha: {c.trail}</p>
                <p className="text-sm text-gray-600">Emitido em: {new Date(c.issuedAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
