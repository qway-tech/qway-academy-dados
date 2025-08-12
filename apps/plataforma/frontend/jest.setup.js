// jest.setup.js
// ---- Polyfills / globals safe-guards ----
const { TextEncoder, TextDecoder } = require('util');

if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// ---- Web Streams polyfills (para MSW/undici no JSDOM) ----
(() => {
  try {
    // Node 18+ expõe via node:stream/web
    const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
    if (!global.ReadableStream) global.ReadableStream = ReadableStream;
    if (!global.WritableStream) global.WritableStream = WritableStream;
    if (!global.TransformStream) global.TransformStream = TransformStream;
  } catch {
    try {
      // fallback para alguns ambientes
      const { ReadableStream, WritableStream, TransformStream } = require('stream/web');
      if (!global.ReadableStream) global.ReadableStream = ReadableStream;
      if (!global.WritableStream) global.WritableStream = WritableStream;
      if (!global.TransformStream) global.TransformStream = TransformStream;
    } catch {
      // último recurso: ponyfill (instale se necessário: npm i -D web-streams-polyfill)
      try {
        const {
          ReadableStream,
          WritableStream,
          TransformStream,
        } = require('web-streams-polyfill/ponyfill');
        if (!global.ReadableStream) global.ReadableStream = ReadableStream;
        if (!global.WritableStream) global.WritableStream = WritableStream;
        if (!global.TransformStream) global.TransformStream = TransformStream;
      } catch {
        // se ainda faltar, os testes avisarão — mas na maioria dos casos os dois caminhos acima resolvem
      }
    }
  }
})();

if (typeof global.BroadcastChannel === 'undefined') {
  // Lightweight test-only polyfill to satisfy MSW in Jest/JSDOM.
  // We intentionally DO NOT import 'broadcast-channel' here,
  // because that package warns against overwriting a native/global implementation.
  class SimpleBroadcastChannel {
    constructor(name) {
      this.name = name;
      this._listeners = new Set();
      this._onmessage = null;
    }
    postMessage(_msg) {
      // no-op in tests
      if (typeof this._onmessage === 'function') {
        // in case some libs rely on onmessage handler
        this._onmessage({ data: _msg });
      }
      this._listeners.forEach((fn) => {
        try {
          fn({ data: _msg });
        } catch {}
      });
    }
    addEventListener(type, listener) {
      if (type === 'message') this._listeners.add(listener);
    }
    removeEventListener(_type, listener) {
      this._listeners.delete(listener);
    }
    close() {
      this._listeners.clear();
    }
    set onmessage(fn) {
      this._onmessage = fn;
    }
    get onmessage() {
      return this._onmessage;
    }
  }
  global.BroadcastChannel = SimpleBroadcastChannel;
}

// Ensure fetch exists in the JSDOM environment (Node < 18)
// Only polyfill if necessário; ignore caso o pacote não exista (jsdom já fornece em versões novas)
if (typeof global.fetch === 'undefined') {
  try {
    // whatwg-fetch é leve e compatível; use se instalado
    require('whatwg-fetch');
  } catch {
    // Sem polyfill instalado: em jsdom >= 22, fetch já existe; se realmente faltar, os testes apontarão
  }
}

// ---- Testing Library matchers ----
require('@testing-library/jest-dom');
require('jest-axe/extend-expect');

// ---- MSW (Mock Service Worker) server wiring ----
// Fixed path to your MSW server (folder src/__tests__/msw)
const { server } = require('./src/__tests__/msw/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Optional: tame noisy console errors in tests (e.g., React Router warnings)
// const originalError = console.error;
// console.error = (...args) => {
//   if (/(Warning:.*not wrapped in act)|(React Router)/.test(args[0])) return;
//   originalError(...args);
// };
