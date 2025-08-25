import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { getTrails } from '@/services/api';

export default function Home() {
  const [trails, setTrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrails() {
      try {
        const res: any = await getTrails();
        setTrails(res || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar trilhas');
      } finally {
        setLoading(false);
      }
    }
    fetchTrails();
  }, []);

  return (
    <MainLayout>
      <div data-testid="page-home" className="space-y-6">
        <h1 className="text-4xl font-bold text-heading">Bem‑Vindos ao QATS</h1>
        <p className="text-body text-lg">
          O <strong>QATS</strong> (Qualificação Aberta em QA e Testes de Software) é um projeto
          open‑source e colaborativo que tem como objetivo oferecer um caminho estruturado, ético e
          gratuito para formação de profissionais de Qualidade de Software.
        </p>
        <p className="text-body">
          Baseado em syllabi, normas ISO/IEC/IEEE, livros técnicos e práticas reais do mercado
          brasileiro, o projeto disponibiliza trilhas de certificação com materiais de estudo,
          simulados, quizzes, provas e muito mais.
        </p>
        <p className="text-body">
          A comunidade também participa ativamente da curadoria do conteúdo, tornando o aprendizado
          mais acessível e alinhado às necessidades do mercado.
        </p>
        <p className="text-body">
          Comece explorando os materiais de estudo ou simule uma prova para testar seus
          conhecimentos!
        </p>
        <p className="text-body text-sm italic">
          Este site é a plataforma oficial de aplicação das avaliações do projeto. Todo o conteúdo
          educacional, materiais de estudo e documentação estão disponíveis no repositório do
          projeto no GitHub.
        </p>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Trilhas disponíveis</h2>
          {loading && <p>Carregando trilhas…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && trails.length === 0 && <p>Nenhuma trilha cadastrada.</p>}
          {!loading && !error && trails.length > 0 && (
            <ul className="space-y-3">
              {trails.map((t: any) => (
                <li
                  key={t.id}
                  className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {t.title}{' '}
                      <span className="text-sm text-gray-500">({t.slug})</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {(t.modules?.length ?? 0)} módulos cadastrados
                    </p>
                  </div>
                  <Link
                    to="/quiz"
                    className="mt-2 md:mt-0 inline-block bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Ver Avaliações
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
