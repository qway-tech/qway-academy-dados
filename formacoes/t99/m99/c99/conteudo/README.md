# 📚 Conteúdo — Capítulo CXX – *Título do Capítulo*

> **Como usar este template:** Substitua `CXX` pelo identificador do capítulo (ex.: `C01`) e "*Título do Capítulo*" pelo nome oficial.  
> Este arquivo contém **todo o material de estudo** do capítulo. A introdução e objetivos gerais ficam no README da raiz do capítulo.

---

## 🧭 Navegação Rápida

- [1. Seção / Tópico Principal](#1-seção--tópico-principal)
- [2. Próxima Seção / Tópico](#2-próxima-seção--tópico)
- [3. Estudos de Caso (Opcional)](#3-estudos-de-caso-opcional)
- [4. Atividades de Fixação](#4-atividades-de-fixação)
- [5. Referências Complementares](#5-referências-complementares)
- [📂 Estrutura desta pasta](#-estrutura-desta-pasta)
- [🛠️ Como atualizar este conteúdo](#️-como-atualizar-este-conteúdo)
- [↩️ Voltar ao capítulo](#️-voltar-ao-capítulo)

---

## 1. Seção / Tópico Principal

Explique o conceito, dê contexto e relevância prática. Use exemplos curtos e objetivos.

- **Definição:** descreva o conceito em 1–2 parágrafos.
- **Por que importa:** relacione com situações reais de QA/Testes.
- **Exemplo prático:** narre um mini-caso com entrada → processo → saída.
- **Dica de visual:** inclua uma imagem localizada em `conteudo/imagens`.  
  Ex.: `![Fluxo resumido](./imagens/fluxo-exemplo.png "Fluxo resumido")`

**Tabela de comparação (exemplo):**

| Conceito | Descrição breve | Exemplo prático |
|---|---|---|
| QA | Garantia de que o processo produz qualidade | Padrões de código, revisão por pares |
| Teste | Evidência de que o produto funciona | Teste funcional, integração, a11y |

---

## 2. Próxima Seção / Tópico

Aprofunde o tema, crie subitens se necessário e relacione com métricas/boas práticas.

- **Detalhamento:** nuances, exceções e limitações.
- **Relacionamentos:** como o tema se conecta a outros tópicos do capítulo.
- **Erros comuns:** liste armadilhas a evitar.
- **Checklist rápido:**  
  - Termos essenciais compreendidos  
  - Passos para aplicar o conceito no dia a dia  
  - Indicadores para saber se deu certo

---

## 3. Estudos de Caso (Opcional)

> Use esta seção se o capítulo se beneficiar de um cenário mais completo.

- **Cenário:** descreva o contexto.
- **Desafio:** o que precisa ser resolvido.
- **Solução comentada:** passo a passo com justificativas.
- **Aprendizados-chave:** 3–5 bullets com o “pulo do gato”.

---

## 4. Atividades de Fixação

> Objetivo: praticar os conceitos e reforçar a compreensão.

Sugestões de atividades:
- Elaborar um **mapa mental** com conceitos do capítulo.
- Criar uma **lista de critérios de aceitação** para um micro-requisito.
- Avaliar um **trecho de especificação** e sugerir melhorias.
- Construir um **mini check-list** aplicável ao dia a dia.

Dica: se o capítulo tiver muitas atividades, crie `conteudo/atividades.md` e linke aqui:  
Veja: `[Atividades extras](./atividades.md)`.

---

## 5. Referências Complementares

> Materiais para aprofundamento (além das referências obrigatórias do README da raiz do capítulo).

- Normas e padrões (ex.: ISO/IEC/IEEE relevantes ao tema)
- Syllabus de certificações (ex.: CTFL v4.0 — se aplicável)
- Documentações oficiais de ferramentas
- Livros, artigos, vídeos e palestras técnicas

Formato recomendado para referências:
- **Autor(es). Título. Fonte/Veículo, ano.** URL (quando aplicável)

---

## 📂 Estrutura desta pasta

- `conteudo/README.md` *(este arquivo)*  
- `conteudo/imagens/` *(opcional — imagens usadas no conteúdo)*  
- `conteudo/anexos/` *(opcional — PDFs, planilhas, exemplos longos)*  
- `conteudo/atividades.md` *(opcional — exercícios e desafios adicionais)*

> Mantenha nomes de arquivos **descritivos** e use **kebab-case** (ex.: `fluxo-exemplo.png`, `checklist-a11y.pdf`).

---

## 🛠️ Como atualizar este conteúdo

1. **Clareza primeiro:** priorize linguagem simples e exemplos reais.  
2. **Coesão:** verifique se as seções contam uma história contínua.  
3. **Consistência visual:** títulos com emojis, tabelas e listas padronizadas.  
4. **Links relativos:** use caminhos relativos (ex.: `../README.md`, `./imagens/...`).  
5. **Revisão cruzada:** peça revisão a outra pessoa antes do PR.

---

## ↩️ Voltar ao capítulo

- Voltar ao README do capítulo: `../README.md`  
- Ir para o Quiz: `../quiz/perguntas.json`

---

**Feito com 💛 pela comunidade QATS.**  
Sugestões? Abra uma *Issue* no repositório com o rótulo `conteudo`.