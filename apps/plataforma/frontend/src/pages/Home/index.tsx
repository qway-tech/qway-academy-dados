import MainLayout from '@/components/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div data-testid="page-home" className="space-y-6">
        <h1 className="text-4xl font-bold text-heading">
          Bem-Vindos ao QATS
        </h1>
        <p className="text-body text-lg">
          O{' '}
          <strong>
            QATS
          </strong>{' '}
          (Qualificação Aberta em QA e Testes de Software) é um projeto open-source e colaborativo
          que tem como objetivo oferecer um caminho estruturado, ético e gratuito para formação de
          profissionais de Qualidade de Software.
        </p>
        <p className="text-body">
          Baseado em syllabi, normas ISO/IEC/IEEE, livros técnicos e práticas reais do mercado
          brasileiro, o projeto disponibiliza trilhas de certificação com materiais de estudo,
          simulados, quizzes, provas e muito mais.
        </p>
        <p className="text-body">
          A comunidade também participa ativamente da curadoria do conteúdo, tornando o aprendizado
          mais acessível, transparente e alinhado às necessidades do mercado.
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
      </div>
    </MainLayout>
  );
}
