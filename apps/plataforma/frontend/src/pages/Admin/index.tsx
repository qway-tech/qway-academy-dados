import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import {
  getTrails,
  createTrail,
  createModule,
  createLesson,
} from '@/services/api';
import { getCurrentUser } from '@/features/auth/services/authService';

/**
 * Página de administração. Permite a criação de trilhas, módulos e lições
 * através de formulários simples. Todas as ações são protegidas pelo
 * backend via JWT e exigem o perfil ADMIN. O front‑end não impede o
 * acesso de estudantes, mas as chamadas retornarão 403 caso o papel
 * esteja incorreto.
 */
export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trails, setTrails] = useState<any[]>([]);

  // Form states
  const [newTrailSlug, setNewTrailSlug] = useState('');
  const [newTrailTitle, setNewTrailTitle] = useState('');

  const [selectedTrailId, setSelectedTrailId] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // verifica se usuário está autenticado; se não, deixa carregando falso e permite fallback
        await getCurrentUser();
        const res: any = await getTrails();
        setTrails(res || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar trilhas');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateTrail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrail(newTrailSlug, newTrailTitle);
      setMessage(`Trilha ${newTrailSlug} criada com sucesso.`);
      setNewTrailSlug('');
      setNewTrailTitle('');
      // recarrega trilhas
      const res: any = await getTrails();
      setTrails(res || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar trilha');
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrailId) {
      setError('Selecione uma trilha para criar o módulo');
      return;
    }
    try {
      await createModule(selectedTrailId, newModuleTitle);
      setMessage('Módulo criado com sucesso.');
      setNewModuleTitle('');
      // recarrega trilhas para atualizar lista de módulos
      const res: any = await getTrails();
      setTrails(res || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar módulo');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleId) {
      setError('Selecione um módulo para criar a lição');
      return;
    }
    try {
      await createLesson(selectedModuleId, newLessonTitle, newLessonContent);
      setMessage('Lição criada com sucesso.');
      setNewLessonTitle('');
      setNewLessonContent('');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar lição');
    }
  };

  // obtem lista de módulos combinando trilhas
  const allModules = trails.flatMap((t: any) =>
    (t.modules || []).map((m: any) => ({ id: m.id, title: m.title, trailSlug: t.slug })),
  );

  return (
    <MainLayout>
      <h1 className="text-4xl font-bold mb-6" data-testid="page-admin">🔧 Administração</h1>
      {loading && <p>Carregando dados…</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="space-y-12">
          {message && <p className="text-green-600">{message}</p>}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Criar Trilha</h2>
            <form onSubmit={handleCreateTrail} className="flex flex-col space-y-2 max-w-md">
              <input
                type="text"
                placeholder="Slug (ex.: t01)"
                value={newTrailSlug}
                onChange={(e) => setNewTrailSlug(e.target.value)}
                className="border px-2 py-1"
                required
              />
              <input
                type="text"
                placeholder="Título da trilha"
                value={newTrailTitle}
                onChange={(e) => setNewTrailTitle(e.target.value)}
                className="border px-2 py-1"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Criar Trilha
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Criar Módulo</h2>
            <form onSubmit={handleCreateModule} className="flex flex-col space-y-2 max-w-md">
              <select
                value={selectedTrailId}
                onChange={(e) => setSelectedTrailId(e.target.value)}
                className="border px-2 py-1"
                required
              >
                <option value="" disabled>
                  Selecione uma trilha
                </option>
                {trails.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.slug} — {t.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título do módulo"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                className="border px-2 py-1"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Criar Módulo
              </button>
            </form>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Criar Lição</h2>
            <form onSubmit={handleCreateLesson} className="flex flex-col space-y-2 max-w-md">
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="border px-2 py-1"
                required
              >
                <option value="" disabled>
                  Selecione um módulo
                </option>
                {allModules.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.trailSlug} / {m.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título da lição"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="border px-2 py-1"
                required
              />
              <textarea
                placeholder="Conteúdo da lição"
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
                className="border px-2 py-1 h-24"
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Criar Lição
              </button>
            </form>
          </section>
        </div>
      )}
    </MainLayout>
  );
}
