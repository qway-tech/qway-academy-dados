import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import {
  getAssessment,
  createAttempt,
  answerQuestion,
  finishAttempt,
} from '@/services/api';

export default function Prova() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const assessmentId = searchParams.get('assessmentId') ?? '';
  const [assessment, setAssessment] = useState<any | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Cria tentativa e obtém detalhes da avaliação ao carregar
  useEffect(() => {
    async function init() {
      if (!assessmentId) {
        setError('Identificador de avaliação inválido');
        setLoading(false);
        return;
      }
      try {
        // Cria uma tentativa para o usuário autenticado
        const attemptRes: any = await createAttempt(assessmentId);
        setAttemptId(attemptRes.id);
        const assessRes: any = await getAssessment(assessmentId);
        setAssessment(assessRes);
      } catch (err: any) {
        setError(err.message || 'Erro ao iniciar avaliação');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [assessmentId]);

  // Quando usuário seleciona uma alternativa, salva estado local e envia para API
  const handleSelect = async (
    questionId: string,
    choiceId: string,
  ) => {
    if (!attemptId) return;
    // Atualiza localmente imediatamente
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    try {
      await answerQuestion(attemptId, questionId, choiceId);
    } catch (err) {
      // Falha silenciosa; poderia exibir erro
    }
  };

  const handleFinish = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const res: any = await finishAttempt(attemptId);
      const score = res?.score ?? 0;
      // Redireciona para página de resultado com score e id da avaliação
      navigate(`/resultado?score=${encodeURIComponent(score)}&assessmentId=${encodeURIComponent(assessmentId)}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div data-testid="page-prova" className="space-y-6">
        {loading && <p>Carregando avaliação…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && assessment && (
          <>
            <h1 className="text-4xl font-bold">📝 {assessment.title}</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFinish();
              }}
              className="space-y-6"
            >
              {assessment.questions.map((q: any, idx: number) => (
                <div key={q.id} className="border rounded p-4 space-y-2">
                  <p className="font-semibold">
                    {idx + 1}. {q.stem}
                  </p>
                    {q.choices.map((c: any) => (
                      <label key={c.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="radio"
                          name={q.id}
                          value={c.id}
                          checked={answers[q.id] === c.id}
                          onChange={() => handleSelect(q.id, c.id)}
                          className="form-radio text-blue-600"
                        />
                        <span>{c.text}</span>
                      </label>
                    ))}
                </div>
              ))}
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {submitting ? 'Enviando…' : 'Finalizar'}
              </button>
            </form>
          </>
        )}
      </div>
    </MainLayout>
  );
}
