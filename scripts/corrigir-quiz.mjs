//scripts/corrigir-quiz.mjs

import fs from "node:fs";
import path from "node:path";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

function upper(x) { return String(x || "").toUpperCase(); }

// Validação leve do arquivo de respostas
function validateRespostas(json) {
  const errors = [];
  if (!json || typeof json !== "object") {
    errors.push("JSON raiz inválido");
    return { valid: false, errors };
  }
  if (!Array.isArray(json.respostas) || json.respostas.length === 0) {
    errors.push("Campo 'respostas' ausente ou vazio");
  } else {
    json.respostas.forEach((r, i) => {
      if (!r || typeof r !== "object") errors.push(`respostas[${i}] não é objeto`);
      if (typeof r?.pergunta_id !== "string") errors.push(`respostas[${i}].pergunta_id ausente/inválido`);
      if (typeof r?.resposta_index !== "number" || !Number.isInteger(r.resposta_index)) {
        errors.push(`respostas[${i}].resposta_index ausente/inválido`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

(async () => {
  try {
    const respostasPath = process.env.ARQUIVO;
    if (!respostasPath) {
      throw new Error("ARQUIVO não informado no ambiente.");
    }
    console.log("➡️ Corrigindo arquivo de respostas detectado pelo workflow.");

    // Derivar Txx / Myy (apenas para metadados/ambiente)
    const trilha = (respostasPath.match(/\/(t[0-9]+)\//i)?.[1] || "").toUpperCase();
    const modulo = (respostasPath.match(/\/(m[0-9]+)\//i)?.[1] || "").toUpperCase();
    const envname = `${trilha}-${modulo}`;

    // Carregar respostas do arquivo
    const respostas = readJson(respostasPath);

    // Validação básica
    const v = validateRespostas(respostas);
    if (!v.valid) {
      throw new Error("Respostas inválidas: " + v.errors.join("; "));
    }

    // =============================
    // Carregar gabarito por capítulo
    // Secret esperado: GABARITO_TXX_MYY_CZZ (ex.: GABARITO_T01_M01_C01)
    // Formato recomendado: { "P01": 1, "P02": 3, ... }
    // (Opcionalmente aceita letra: { "P01": "B" } -> 1)
    // =============================
    const capitulo = (respostasPath.match(/\/(c[0-9]+)\//i)?.[1] || respostas.capitulo || "").toUpperCase();
    if (!capitulo) throw new Error("Não foi possível identificar o capítulo (Cxx) a partir do caminho/JSON de respostas.");

    const secretName = `GABARITO_${trilha}_${modulo}_${capitulo}`; // e.g., GABARITO_T01_M01_C01
    const rawSecret = process.env[secretName];
    if (!rawSecret) {
      throw new Error(`Secret ${secretName} não encontrado no Environment. Configure um secret por capítulo.`);
    }

    let gabaritos;
    try {
      gabaritos = JSON.parse(rawSecret);
    } catch {
      throw new Error(`Secret ${secretName} não é JSON válido.`);
    }
    if (!gabaritos || typeof gabaritos !== "object" || Array.isArray(gabaritos)) {
      throw new Error(`Secret ${secretName} deve ser um objeto no formato { "Pxx": indice|letra }.`);
    }

    // Normaliza valores: letra -> índice (A=0, B=1, ...)
    const norm = {};
    const ACode = "A".charCodeAt(0);
    for (const [pid, val] of Object.entries(gabaritos)) {
      if (typeof val === "number" && Number.isInteger(val)) {
        norm[pid] = val;
      } else if (typeof val === "string" && val.trim()) {
        const up = val.trim().toUpperCase();
        const idx = up.charCodeAt(0) - ACode; // A->0, B->1...
        if (idx >= 0 && idx < 26) {
          norm[pid] = idx;
        }
      }
    }
    if (Object.keys(norm).length === 0) {
      throw new Error(`Secret ${secretName} não contém pares válidos pergunta_id -> índice/letra.`);
    }

    // Correção (sem detalhar por pergunta para evitar engenharia reversa)
    let acertos = 0;
    let erros = 0;
    let semGabarito = 0;

    for (const r of respostas.respostas) {
      const pid = r.pergunta_id;
      const ri = Number.isInteger(r.resposta_index) ? r.resposta_index : null;
      const correto = Object.prototype.hasOwnProperty.call(norm, pid)
        ? norm[pid]
        : undefined;

      if (typeof correto !== "number") {
        semGabarito++;
        // Sem gabarito para a pergunta -> consideramos incorreta, mas não vazamos detalhes
        erros++;
        continue;
      }

      const ok = ri !== null && ri === correto;
      if (ok) acertos++; else erros++;
    }

    const total = respostas.respostas.length;
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0;

    // Feedback padrão ou substituído via secret opcional FEEDBACK_OVERRIDE (mapa por faixa)
    const feedbackOverride = (() => {
      try { return JSON.parse(process.env.FEEDBACK_OVERRIDE || "null"); } catch { return null; }
    })();

    function defaultFeedback(p) {
      if (p === 100) return "Excelente! 👏";
      if (p >= 80) return "Ótimo desempenho! Continue assim.";
      if (p >= 60) return "Bom! Revise alguns pontos para melhorar.";
      return "Recomendo revisar o conteúdo antes de tentar novamente.";
    }

    const feedback = (() => {
      if (feedbackOverride && typeof feedbackOverride === "object") {
        // formato esperado: { "100":"msg", "80":"msg", "60":"msg", "0":"msg" }
        const keys = Object.keys(feedbackOverride)
          .map(k => Number(k))
          .filter(n => !Number.isNaN(n))
          .sort((a,b) => b - a);
        for (const k of keys) {
          if (percentual >= k) return String(feedbackOverride[String(k)]);
        }
      }
      return defaultFeedback(percentual);
    })();

    // Montar resultados_01.json (sem por-pergunta)
    const out = {
      usuario: respostas.usuario ?? "@desconhecido",
      trilha: upper(respostas.trilha ?? trilha),
      modulo: upper(respostas.modulo ?? modulo),
      capitulo: upper(respostas.capitulo ?? "C??"),
      tipo: "quiz",
      tentativa: Number.isInteger(respostas.tentativa) ? respostas.tentativa : 1,
      avaliado_em: new Date().toISOString(),
      avaliador: "workflow_corrigir_quiz",
      pontuacao: { total_questoes: total, acertos, erros, percentual },
      feedback,
      meta: {
        versao_quiz: respostas?.meta?.versao_quiz ?? "v1.0",
        corrigido_via: "github-action",
        gabarito_secret: secretName,
        perguntas_sem_gabarito: semGabarito
      }
    };

    // Gravar ao lado do respostas_01.json
    const dir = path.dirname(respostasPath);
    const outPath = path.join(dir, "resultados_01.json");
    writeJson(outPath, out);

    console.log(`✅ Resultados gerados: ${outPath}`);
  } catch (err) {
    const msg = err?.message || String(err);
    console.error("❌ Falha na correção:", msg);
    process.exit(1);
  }
})();