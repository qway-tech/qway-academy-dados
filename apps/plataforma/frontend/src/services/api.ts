// src/services/api.ts
//
// Este módulo centraliza todas as chamadas HTTP da aplicação front‑end
// para o backend NestJS. Cada função encapsula um endpoint REST e
// utiliza cookies de sessão através da opção `credentials: 'include'`.
// Dessa forma, o front não manipula tokens manualmente; o JWT
// permanece em cookie http-only e é enviado automaticamente pelo
// navegador. Em caso de erro de rede ou status não OK, as funções
// lançam uma exceção para ser tratada pelos componentes.

const BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro na requisição');
  }
  return res.json();
}

// Catálogo
export async function getTrails() {
  const res = await fetch(`${BASE_URL}/catalog/trails`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getTrail(slug: string) {
  const res = await fetch(`${BASE_URL}/catalog/trails/${encodeURIComponent(slug)}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getModule(id: string) {
  const res = await fetch(`${BASE_URL}/catalog/modules/${encodeURIComponent(id)}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getLesson(id: string) {
  const res = await fetch(`${BASE_URL}/catalog/lessons/${encodeURIComponent(id)}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function createTrail(slug: string, title: string) {
  const res = await fetch(`${BASE_URL}/catalog/trails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ slug, title }),
  });
  return handleResponse(res);
}

export async function createModule(trailId: string, title: string) {
  const res = await fetch(`${BASE_URL}/catalog/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ trailId, title }),
  });
  return handleResponse(res);
}

export async function createLesson(moduleId: string, title: string, content: string) {
  const res = await fetch(`${BASE_URL}/catalog/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ moduleId, title, content }),
  });
  return handleResponse(res);
}

// Avaliações
export async function getAssessments() {
  const res = await fetch(`${BASE_URL}/assessments`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getAssessment(id: string) {
  const res = await fetch(`${BASE_URL}/assessments/${encodeURIComponent(id)}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function createAssessment(moduleId: string, title: string) {
  const res = await fetch(`${BASE_URL}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ moduleId, title }),
  });
  return handleResponse(res);
}

export async function updateAssessment(id: string, title: string) {
  const res = await fetch(`${BASE_URL}/assessments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title }),
  });
  return handleResponse(res);
}

// Tentativas (Attempts)
export async function createAttempt(assessmentId: string) {
  const res = await fetch(`${BASE_URL}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ assessmentId }),
  });
  return handleResponse(res);
}

export async function answerQuestion(
  attemptId: string,
  questionId: string,
  choiceId: string,
) {
  const res = await fetch(`${BASE_URL}/attempts/${encodeURIComponent(attemptId)}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ questionId, choiceId }),
  });
  return handleResponse(res);
}

export async function finishAttempt(attemptId: string) {
  const res = await fetch(`${BASE_URL}/attempts/${encodeURIComponent(attemptId)}/finish`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(res);
}

// Progresso
export async function getProgress(userId: string) {
  const res = await fetch(`${BASE_URL}/progress/${encodeURIComponent(userId)}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getTrailProgress(userId: string) {
  const res = await fetch(`${BASE_URL}/progress/${encodeURIComponent(userId)}/trails`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getCertificates(userId: string) {
  const res = await fetch(`${BASE_URL}/progress/${encodeURIComponent(userId)}/certificates`, {
    credentials: 'include',
  });
  return handleResponse(res);
}