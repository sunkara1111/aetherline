import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aetherline - Industrial Signal Narrative Workbench | Real-Time Automation Monitoring',
  description: 'Aetherline: Modern industrial automation monitoring platform with real-time signal visualization, intelligent alarm pattern recognition, automated response procedures, and compliance logging for automation engineers.',
  authors: [{ name: 'Dineshgopi Sunkara' }],
  keywords: ['Aetherline', 'industrial automation', 'signal monitoring', 'real-time visualization', 'alarm management', 'SCADA', 'process control', 'automation engineering', 'signal intelligence', 'industrial IoT'],
  openGraph: {
    title: 'Aetherline - Industrial Signal Narrative Workbench',
    description: 'Real-time signal visualization, intelligent alarm pattern recognition, and automated response procedures for modern automation engineers.',
    url: 'https://sunkara1111.github.io/aetherline/',
    siteName: 'Aetherline',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aetherline - Industrial Signal Narrative Workbench',
    description: 'Real-time signal visualization and intelligent alarm management for automation engineers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  metadataBase: new URL('https://sunkara1111.github.io/aetherline/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
