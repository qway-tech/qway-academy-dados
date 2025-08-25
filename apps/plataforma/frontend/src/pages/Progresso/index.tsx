import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import ProgressBar from '@/components/ProgressBar';
import { getTrailProgress } from '@/services/api';
import { getCurrentUser } from '@/features/auth/services/authService';

export default function Progresso() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
        setUserId(id);
        const res: any = await getTrailProgress(id);
        setProgress(res || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar progresso');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <MainLayout>
      <div data-testid="page-progresso" className="space-y-6">
        <h1 className="text-4xl font-bold">📈 Progresso do Aluno</h1>
        {loading && <p>Carregando progresso…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && progress.length === 0 && <p>Nenhum progresso registrado.</p>}
        {!loading && !error && progress.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trilha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulos
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progress.map((p: any) => {
                  const percent = p.total > 0 ? (p.completed / p.total) * 100 : 0;
                  return (
                    <tr key={p.trailSlug}>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">{p.trailSlug}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {p.completed} / {p.total}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap w-48">
                        <ProgressBar value={p.completed} total={p.total} />
                        <span className="text-sm ml-2 align-middle">{percent.toFixed(0)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && userId && (
          <div className="mt-4">
            <Link to="/certificados" className="bg-blue-600 text-white px-4 py-2 rounded">
              Ver Certificados
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
