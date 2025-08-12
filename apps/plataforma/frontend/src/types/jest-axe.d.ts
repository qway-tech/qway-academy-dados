// src/types/jest-axe.d.ts
import 'jest-axe/extend-expect';

declare module 'jest-axe' {
  // Tipagem mínima suficiente pro uso atual
  export function axe(node: HTMLElement | DocumentFragment, options?: unknown): Promise<unknown>;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

export {};
