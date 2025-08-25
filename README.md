# QATS - Qualificação Aberta em QA e Teste de Software

Bem-vindo(a) ao repositório oficial da iniciativa **QATS**: um projeto open-source, gratuito e comunitário voltado à formação prática em **Qualidade de Software (QA)** e **Testes de Software**.

Nosso objetivo é oferecer uma formação técnica real, com:

- 🧠 Conteúdos baseados em syllabus reconhecidos (ex: ISTQB/CTFL)
- 📚 Referências de normas internacionais (ex: ISO/IEC/IEEE)
- 🇧🇷 Adaptação ao contexto brasileiro e linguagem acessível
- 🤝 Contribuição pública, auditável e 100% comunitária

Tudo construído **por e para a comunidade brasileira de QA**.

---

## 🎥 Apresentação do Projeto QATS

Assista ao vídeo de apresentação da iniciativa, explicando os objetivos, estrutura e formas de contribuição para o projeto de Qualificação Aberta em QA e Testes de Software:

[![▶️ Assista ao vídeo no YouTube](assets/images/video-apresentacao.png)](https://youtu.be/6DT8OPQsJhI)  
*Clique na imagem acima para assistir ao vídeo no YouTube.*

---

## 🧭 Navegue pela Documentação

| Seção                          | Descrição                                                                                       |
|--------------------------------|------------------------------------------------------------------------------------------------|
| [01 - Sobre o Projeto](docs/01-Sobre-o-Projeto.md)         | Missão, visão, valores, governança e apoio institucional.                                   |
| [02 - Como Participar](docs/02-Como-Participar.md)       | Formas de contribuição, regras e como se tornar membro temporário.                       |
| [03 - Trilhas e Programas](docs/03-Trilhas-e-Programas.md)                     | Estrutura das trilhas de formação, módulos e certificação.                       |
| [04 - Licença](docs/04-Licenca.md) | Informações sobre a licença aberta CC BY-SA 4.0.                                 |
| [05 - Recursos Adicionais](docs/05-Recursos-Adicionais.md)             | Links úteis, FAQ futuro, templates e referências externas.                                         |

---

## 🏛️ Instituições Apoiadoras

Apoiam esta iniciativa instituições que:

- Valorizam a qualificação aberta e transparente
- Reconhecem as certificações QATS como parte de seus critérios de avaliação
- Compartilham os valores de ética, acessibilidade e boas práticas no mercado de QA

<table>
  <tr>
    <td width="33%" align="center" valign="middle">
      <img src="https://github.com/user-attachments/assets/d6beb057-eefb-49ac-af17-d72cb7fdb86d" style="max-width: 100%; height: auto;"><br>
      <strong><a href="https://www.qway.com.br">QWay</a></strong><br>
      <sub>Comunidade global de QA e Testes de Software. Oferece cursos, mentorias, eventos e conteúdos técnicos para profissionais da área.</sub>
    </td>
    <td width="33%" align="center" valign="middle">
      <strong>📣 Sua instituição aqui!</strong><br>
      <sub>Apoie a iniciativa QATS e tenha sua marca reconhecida como parceira da qualificação aberta em QA.</sub><br>
      <a href="https://github.com/qway-tech/qats/wiki/07-%E2%80%90-Apoio-Institucional">💬 Saiba como apoiar</a>
    </td>
    <td width="33%" align="center" valign="middle">
      <strong>📣 Seja um apoiador!</strong><br>
      <sub>Mostre seu compromisso com a educação técnica e ética no mercado de QA. Apoio gratuito e com destaque institucional.</sub><br>
      <a href="https://github.com/qway-tech/qats/issues/new?template=apoio-institucional.yml&title=%F0%9F%8F%A2%20[Apoio]%20Nome%20da%20Institui%C3%A7%C3%A3o">💬 Apoie agora</a>
    </td>
  </tr>
</table>

---

## 📦 Estrutura e Ambiente de Desenvolvimento

Este repositório adota um **monorepo** para agrupar aplicação web, API e infraestrutura em uma única base de código. A estrutura foi desenhada para evidenciar as responsabilidades de cada camada:

- `apps/plataforma/frontend` - aplicação web construída com **React**, **Vite** e **TypeScript**, responsável pela experiência do usuário: login via GitHub, navegação por trilhas e módulos, realização de avaliações, exibição de progresso e emissão de certificados. O front‑end utiliza componentes reutilizáveis, contextos para autenticação e serviços para chamada à API.
- `apps/plataforma/backend` - API em **NestJS** com **Prisma** para acesso ao banco **PostgreSQL**, organizada em módulos coerentes com o domínio: autenticação, usuários, catálogo, avaliações, tentativas, progresso e notificações. Cada módulo possui controllers, serviços de aplicação, entidades de domínio e repositórios. Esta separação facilita testes e evolução incremental.
- `infra/docker/docker-compose.yml` - orquestração de serviços de apoio como PostgreSQL e Redis para ambientes de desenvolvimento. Também define build e execução dos containers do front‑end e do back‑end, permitindo levantar toda a stack com um único comando.
- Nas versões iniciais do QATS existiam diretórios `catalogo`, `trilhas` e `usuarios` contendo dados estáticos em formato JSON. Com a adoção de um banco de dados relacional e de uma API completa, esses arquivos deixaram de ser utilizados e foram removidos do repositório para evitar divergência de origem. Todo o conteúdo educacional (trilhas, módulos, lições, avaliações e questões) agora é persistido no banco de dados e exposto exclusivamente via API. Se encontrar esses diretórios em alguma cópia local, eles podem ser excluídos com segurança.

### Configuração de variáveis de ambiente (.env)

Para rodar o back‑end, copie o arquivo `.env.example` em `apps/plataforma/backend` para `.env` e preencha os campos:

```
PORT=4000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/qats
JWT_SECRET=<segredo>
# endereço do Redis utilizado para cache e filas. Em desenvolvimento via Docker Compose use redis://redis:6379
REDIS_URL=redis://localhost:6379
GITHUB_CLIENT_ID=<id>
GITHUB_CLIENT_SECRET=<segredo>
GITHUB_REDIRECT_URI=http://localhost:5173/auth/callback
```

No front‑end, copie o arquivo `apps/plataforma/frontend/.env.example` para `.env` dentro do mesmo diretório e ajuste os valores de `VITE_API_BASE_URL` e `VITE_GITHUB_CLIENT_ID`. O primeiro indica o endereço da API e, em ambiente local, deve ser `http://localhost:4000`. O segundo corresponde ao identificador da aplicação GitHub usada no fluxo OAuth.

### Utilizando Docker

Para quem prefere um ambiente totalmente encapsulado, o repositório fornece **Dockerfiles** para a API e a aplicação web, juntamente com um arquivo `docker-compose.yml` em `infra/docker`. Através do Compose é possível levantar toda a stack com um único comando. Há duas formas equivalentes de executar o ambiente:

```bash
# Execução direta com Docker Compose
docker compose -f infra/docker/docker-compose.yml up --build

# ou utilizando o script de conveniência no package.json
npm run docker:compose
```

 Ambas as opções realizam o build das imagens do back‑end e do front‑end, iniciam o banco de dados PostgreSQL e o Redis com credenciais padrão e expõem os serviços nas portas 4000 (API) e 5173 (web). A variável `DATABASE_URL` no `.env` da API deve apontar para `postgresql://qats:qats@db:5432/qats` e `REDIS_URL` deve ser `redis://redis:6379` quando estiver rodando via Compose. Para que a SPA funcione corretamente, defina `VITE_API_BASE_URL` e `VITE_GITHUB_CLIENT_ID` em `apps/plataforma/frontend/.env` ou em um arquivo `.env` ao lado de `docker-compose.yml`; o Compose passa essas variáveis para o container do front‑end. Ao finalizar os testes, basta executar `docker compose down` ou `npm run docker:down` para encerrar e remover os containers.

### Como rodar localmente

1. Instale as dependências na raiz com `npm install` ou `npm ci`. Esse script explora o recurso de *workspaces* para instalar simultaneamente os pacotes do front‑end e do back‑end.
2. Caso deseje levantar apenas os serviços de apoio, execute `docker compose -f infra/docker/docker-compose.yml up -d db redis`. Isso iniciará o PostgreSQL e o Redis em segundo plano.
3. Na pasta `apps/plataforma/backend`, copie `.env.example` para `.env` e ajuste as variáveis conforme seu ambiente local. Em seguida, execute `npx prisma migrate dev` para aplicar as migrações e `npm run dev` para iniciar a API em modo de desenvolvimento (porta 4000).
4. Em outra janela de terminal, navegue até `apps/plataforma/frontend`, crie um arquivo `.env.local` definindo ao menos `VITE_API_BASE_URL=http://localhost:4000` e execute `npm run dev -- --host` para iniciar o servidor Vite (porta 5173). O parâmetro `--host` permite acessar a aplicação via navegador externo ou em containers.
5. Acesse a interface em `http://localhost:5173` e a API em `http://localhost:4000`. Para encerrar os serviços de apoio iniciados via Compose, execute `docker compose down` no mesmo diretório.

### Arquitetura da plataforma

A plataforma é um **monólito modular** construído com [NestJS](https://docs.nestjs.com/), um framework Node focado em escalabilidade. Ao invés de um serviço único e caótico, dividimos o código em **módulos** alinhados aos conceitos de negócio (auth, usuários, catálogo, avaliações, tentativas, progresso e notificações). Cada módulo contém sua própria camada de apresentação (controllers), camada de aplicação (services), camada de domínio (entidades e regras) e camada de infraestrutura (repositórios, gateways e integrações externas). Essa divisão cria fronteiras claras e evita dependências cíclicas, facilitando a compreensão e a manutenção do sistema.

- **Auth** integra com o OAuth GitHub via PKCE e emite tokens JWT de curta duração.
- **Users** gerencia a persistência de usuários com Prisma.
- **Catalog** expõe trilhas, módulos e lições a partir do banco de dados.
- **Assessment** permite consultar e administrar avaliações, questões e alternativas.
- **Attempts** registra tentativas, respostas e calcula a pontuação.
- **Progress** agrega dados de tentativas para compor relatórios de progresso por usuário e por trilha.
- **Notifications** funciona como stub para futuras integrações com e‑mail ou webhooks.
- **Prisma** centraliza o acesso ao PostgreSQL, simplificando migrações e relações.

#### Camadas internas

1. **HTTP Layer (Controllers + DTOs)** - expõe rotas REST, converte os parâmetros de URL/consulta/corpo em Data Transfer Objects validados com pipes e delega a execução para a camada de aplicação. Não contém lógica de negócio.
2. **Application Layer (Services)** - coordena casos de uso, invocando métodos do domínio e repositórios. Aqui ficam as regras de orquestração como criação de tentativas, correção de avaliações ou emissão de certificados. A camada de aplicação é onde se aplicam transações e lógica de autenticação/autorização (via Guards). Os services são testáveis isoladamente, pois dependem de contratos e não de implementações concretas.
3. **Domain Layer** - abriga entidades, agregados e regras de negócio puras. Por exemplo, uma tentativa de avaliação sabe como calcular sua pontuação ou verificar se foi concluída. O domínio é isolado de frameworks e do banco; isso facilita testes unitários e eventual migração para outras tecnologias.
4. **Infrastructure Layer** - implementa repositórios usando **Prisma** para acesso ao PostgreSQL, gateways HTTP para integrar com GitHub, Redis ou provedores de e‑mail e configura clientes de mensageria. A infraestrutura injeta dependências na aplicação via providers do NestJS, permitindo substituição por implementações “mockadas” em testes.

#### Persistência e performance

O banco relacional **PostgreSQL** é o pilar de persistência. O esquema Prisma define tabelas normalizadas para usuários, trilhas, módulos, lições, avaliações, questões, tentativas e certificados. Cada tabela possui chaves primárias semânticas (por exemplo, `slug` nas trilhas) e chaves estrangeiras com restrições `ON DELETE CASCADE` onde apropriado. Índices são adicionados em colunas de busca frequente (como `userId` em `Attempt`) para reduzir latência. Migrações são versionadas com Prisma Migrate.

Para melhorar a performance de leituras e lidar com tarefas pesadas, utilizamos **Redis** em dois contextos: (1) como cache de consultas quentes, reduzindo ida ao banco para dados imutáveis ou pouco voláteis (ex.: catálogo de trilhas), e (2) como broker de filas via BullMQ para processamento assíncrono (envio de e‑mails de certificado, notificações, etc.). Essa separação permite que a API responda rapidamente, delegando tarefas demoradas a workers.

#### Observabilidade

Um sistema em produção precisa ser observável. A API emite **logs estruturados** em JSON via Pino, contendo identificadores de correlação, nível e contexto. Integramos **OpenTelemetry** para coletar **traces distribuídos** de cada requisição, permitindo seguir o percurso de uma chamada desde o front‑end até o banco. As métricas (tempo de resposta, contagem de erros, utilização de recursos) são exportadas para Prometheus via **NestJS Prometheus**. Dashboards no Grafana permitem detectar anomalias e tendências. Essa pilha de observabilidade facilita troubleshooting e tuning de performance.

#### Evolução e modularidade

A escolha por um monólito modular não impede a adoção futura de microsserviços. Como cada módulo possui interfaces bem definidas, podemos extrair serviços independentes quando a demanda por escala ou autonomia de equipes justificar. Por exemplo, o módulo de notificações pode ser separado para um microserviço que consome eventos de uma fila e envia mensagens por e‑mail ou outras mídias. A presença de um **API Gateway** (NGINX ou Envoy) permite roteamento e autenticação centralizada quando novos serviços surgirem. Enquanto a aplicação não atinge volumes massivos, manter um único artefato simplifica o deploy e a coordenação.

Redis é utilizado para cache e filas assíncronas quando necessário. Esta arquitetura em camadas facilita a separação de responsabilidades, promove testabilidade, possibilita instrumentação e permite evolução gradual para microsserviços. O monorepo reduz atrito entre os times de front‑end e back‑end e unifica configuração, versionamento e dependências.

### Modelos arquiteturais

Para formalizar a visão da plataforma, produzimos uma série de modelos em PlantUML que descrevem as diferentes perspectivas do sistema. Essas visões ajudam a alinhar entendimento entre desenvolvedores, mantenedores e novos contribuidores. Abaixo uma descrição textual de cada modelo em [Arquitetura](docs/arch/):

1. **Visão de Contexto:** identifica os atores (estudantes, administradores) e os sistemas externos (GitHub OAuth, provedor de e‑mail, armazenamento de objetos, observabilidade). Mostra que o usuário interage com uma SPA React hospedada atrás de um Ingress Controller, que por sua vez roteia as requisições para a API NestJS. A API conversa com o banco PostgreSQL, o Redis e serviços externos, exporta métricas e spans para o stack de observabilidade. Essa visão deixa claro o escopo do QATS na paisagem tecnológica e as integrações necessárias para funcionar.

2. **Visão de Containers:** detalha como o sistema é dividido em contêineres lógicos - a borda de rede (Ingress), o front‑end (SPA React via Vite), o back‑end (monólito modular em NestJS), o banco de dados PostgreSQL, o Redis e um armazenamento de objetos (S3/MinIO). Cada container é responsável por uma função específica e comunica‑se via protocolos bem definidos (HTTP, TCP). Esta visão ajuda a planejar a infraestrutura e a distribuição dos serviços em diferentes hosts ou clusters.

3. **Visão de Componentes do Back‑end:** abre o módulo da API em partes internas: camada HTTP, serviços de aplicação, domínio, infraestrutura e módulos (auth, users, catalog, assessment, attempts, progress, notifications). Isso evidencia a separação de responsabilidades dentro do próprio NestJS e mostra como novos módulos podem ser adicionados sem impactar os existentes.

4. **Visão de Implantação:** propõe a implantação em Kubernetes com um *namespace* dedicado, deployments para a API e a SPA, StatefulSet para o Redis, e recursos para observabilidade (OpenTelemetry Collector, Prometheus, Grafana, Jaeger). Mostra também serviços gerenciados externos como RDS/CloudSQL para o banco e buckets para certificados. Essa visão serve de guia quando for hora de mover a solução de um ambiente de desenvolvimento local para uma infraestrutura de produção redundante e escalável.

5. **Diagramas de Sequência:** ilustram fluxos de interação importantes, como o login via OAuth (usuário → SPA → GitHub → API) e a realização de uma avaliação (criação de tentativa, envio de respostas e cálculo de pontuação). Esses diagramas deixam explícitas as chamadas e respostas trocadas entre front‑end e back‑end, incluindo validações de estado e cálculos transacionais.

### Navegação na aplicação web

O front‑end em React oferece uma navegação simples e responsiva entre as principais funcionalidades:

- **Home** - apresenta o projeto QATS, descreve os objetivos da iniciativa e lista as trilhas cadastradas no sistema. Cada trilha exibe seu slug, título e a quantidade de módulos, com um botão para acessar as avaliações.
- **Quiz** - lista todas as avaliações disponíveis, indicando o módulo ao qual pertencem e o número de questões. Cada avaliação possui um botão “Iniciar Prova” que direciona o usuário para a página de execução.
- **Prova** - ao iniciar uma prova, a aplicação cria uma tentativa no back‑end, carrega as questões e permite que o usuário selecione alternativas. As respostas são registradas em tempo real. Ao finalizar, o sistema calcula a pontuação e redireciona para a página de resultados.
- **Resultado** - exibe a nota obtida na avaliação juntamente com o título da prova e uma mensagem de incentivo. Fornece atalhos para visualizar o progresso geral e retornar às avaliações.
- **Progresso** - mostra, por trilha, quantos módulos o usuário concluiu e o total de módulos disponíveis. Exibe graficamente uma barra de progresso proporcional e calcula o percentual de conclusão. Um link leva à lista de certificados.
- **Certificados** - lista as trilhas para as quais o usuário já concluiu todos os módulos, mostrando a data de emissão de cada certificado. Esta funcionalidade exemplifica como uma API pode agregar dados de múltiplas tabelas e expor um artefacto consumível pelo front‑end.
- **Admin** - disponível apenas para administradores autenticados, permite cadastrar novas trilhas, módulos e lições por meio de formulários simples. As ações são protegidas por JWT e verificação de perfil; o back‑end retorna 403 caso um aluno tente realizar uma operação restrita.

Essas páginas utilizam o contexto de autenticação para verificar se o usuário está logado e enviam cookies de sessão em todas as requisições. O serviço `src/services/api.ts` centraliza as chamadas HTTP, reduzindo duplicação e facilitando manutenção.

### Principais endpoints da API

Os recursos do backend seguem convenções REST e utilizam JWT e RBAC para proteção. A tabela abaixo resume os principais endpoints disponíveis na versão atual (v1):

| Método | Caminho | Descrição | Proteção |
| --- | --- | --- | --- |
| `GET` | `/catalog/trails` | Lista todas as trilhas com seus módulos | Pública |
| `GET` | `/catalog/trails/:slug` | Obtém uma trilha específica pelo slug | Pública |
| `GET` | `/catalog/modules/:id` | Obtém um módulo pelo ID, com suas lições | Pública |
| `GET` | `/catalog/lessons/:id` | Obtém uma lição específica | Pública |
| `POST` | `/catalog/trails` | Cria uma nova trilha (`slug`, `title`) | JWT + ADMIN |
| `POST` | `/catalog/trails/:trailId/modules` | Cria um módulo em uma trilha existente (`title`) | JWT + ADMIN |
| `POST` | `/catalog/modules/:moduleId/lessons` | Cria uma lição em um módulo (`title`, `content`) | JWT + ADMIN |
| `GET` | `/assessments` | Lista todas as avaliações com suas questões | Pública |
| `GET` | `/assessments/:id` | Obtém uma avaliação específica | Pública |
| `POST` | `/assessments` | Cria uma nova avaliação (`moduleId`, `title`) | JWT + ADMIN |
| `PUT` | `/assessments/:id` | Atualiza o título de uma avaliação | JWT + ADMIN |
| `POST` | `/attempts` | Cria uma tentativa para o usuário autenticado | JWT |
| `POST` | `/attempts/:id/answer` | Registra a resposta de uma questão em uma tentativa | JWT |
| `POST` | `/attempts/:id/finish` | Finaliza a tentativa e calcula a pontuação | JWT |
| `GET` | `/progress/:userId` | Lista todas as tentativas de um usuário | JWT |
| `GET` | `/progress/:userId/trails` | Retorna progresso agregado por trilha (módulos concluídos e tentados) | JWT |
| `GET` | `/progress/:userId/certificates` | Lista trilhas concluídas pelo usuário e emite certificados | JWT |
| `GET` | `/auth/login` | Gera a URL de autorização do GitHub e armazena o estado em cookie | Pública |
| `GET` | `/auth/callback` | Valida o state, troca o código por token GitHub e emite JWT | Pública |
| `GET` | `/auth/me` | Retorna dados do usuário autenticado | JWT |
| `POST` | `/auth/logout` | Finaliza a sessão removendo cookies | JWT |
| `POST` | `/auth/github/callback` | Suporte legado para troca de código via POST | Pública |

Esses endpoints utilizam mensagens JSON e retornam códigos de status HTTP adequados (200, 201, 400, 401, 403, 404). Para acessar os recursos protegidos, o front‑end envia cookies de sessão e, opcionalmente, cabeçalhos de autenticação quando implementado.

Feito com ❤️ pela comunidade de QA no Brasil.
