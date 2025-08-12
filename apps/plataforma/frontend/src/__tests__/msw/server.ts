import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configuração do MSW (Mock Service Worker) para interceptar requisições HTTP durante os testes
// Isso permite simular respostas de APIs e controlar o comportamento das chamadas de rede
export const server = setupServer(...handlers);

/**
 * Uso recomendado nas suítes de teste:
 *
 * Antes de todos os testes, iniciar o servidor MSW para interceptar as requisições:
 * beforeAll(() => server.listen());
 *
 * Após cada teste, resetar os handlers para evitar efeitos colaterais entre testes:
 * afterEach(() => server.resetHandlers());
 *
 * Após todos os testes, fechar o servidor para liberar recursos:
 * afterAll(() => server.close());
 */
