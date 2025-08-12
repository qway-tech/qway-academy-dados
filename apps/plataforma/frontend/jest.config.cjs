// apps/plataforma/frontend/jest.config.cjs
const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    // transforma TS/TSX (não precisamos transformar .js aqui)
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    // 1) assets com alias "@/..."
    '^@/assets/.*\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // 2) assets sem alias
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // 3) alias geral "@/..."
    '^@/(.*)$': '<rootDir>/src/$1',

    // 🔒 Garante que o React usado nos testes é o do app (evita "Invalid hook call")
    '^react$': path.join(__dirname, 'node_modules/react'),
    '^react-dom$': path.join(__dirname, 'node_modules/react-dom'),
  },
  // Preferir resolver primeiro a partir do node_modules do app
  moduleDirectories: ['<rootDir>/node_modules', 'node_modules'],

  transformIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  clearMocks: true,
};
