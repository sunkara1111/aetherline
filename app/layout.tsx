import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aetherline - Industrial Signal Narrative Workbench',
  description: 'Browser-based industrial automation monitoring and runbook generation platform',
  authors: [{ name: 'Dineshgopi Sunkara' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
