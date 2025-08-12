import type { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return <main className="pt-24 px-6">{children}</main>;
}
