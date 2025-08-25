import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { getAssessment } from '@/services/api';

export default function Resultado() {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessmentId') ?? '';
  const rawScore = searchParams.get('score');
  const [assessment, setAssessment] = useState<any | null>(null);
  const score = rawScore ? parseFloat(rawScore) : null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!assessmentId) {
        setError('Avaliação não encontrada');
        setLoading(false);
        return;
      }
      try {
        const res: any = await getAssessment(assessmentId);
        setAssessment(res);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar resultado');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [assessmentId]);

  const formatScore = (s: number | null) => {
    if (s === null || Number.isNaN(s)) return '—';
    return `${s.toFixed(0)}%`;
  };

  return (
    <MainLayout>
      <div data-testid="page-resultado" className="space-y-6">
        {loading && <p>Carregando resultado…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && assessment && (
          <>
            <h1 className="text-4xl font-bold">📊 Resultado</h1>
            <p className="text-xl">
              Avaliação: <span className="font-semibold">{assessment.title}</span>
            </p>
            <p className="text-lg">
              Sua pontuação: <span className="font-semibold">{formatScore(score)}</span>
            </p>
            <p className="text-lg">
              {score !== null && score >= 70
                ? 'Parabéns, você atingiu a nota mínima para aprovação.'
                : 'Continue estudando e tente novamente para melhorar sua nota.'}
            </p>
            <div className="space-x-4 mt-4">
              <Link to="/progresso" className="bg-blue-600 text-white px-4 py-2 rounded">
                Ver Progresso
              </Link>
              <Link to="/quiz" className="bg-gray-600 text-white px-4 py-2 rounded">
                Voltar às Avaliações
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
