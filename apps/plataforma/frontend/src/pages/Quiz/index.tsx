import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { getAssessments } from '@/services/api';

export default function Quiz() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res: any = await getAssessments();
        setAssessments(res || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar avaliações');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <MainLayout>
      <div data-testid="page-quiz" className="space-y-6">
        <h1 className="text-4xl font-bold">🧠 Avaliações Disponíveis</h1>
        {loading && <p>Carregando avaliações…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && assessments.length === 0 && <p>Nenhuma avaliação encontrada.</p>}
        {!loading && !error && assessments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questões
                  </th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assessments.map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">{a.title}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.module?.title ?? '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.questions?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/prova?assessmentId=${encodeURIComponent(a.id)}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Iniciar Prova
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
