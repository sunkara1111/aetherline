import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const SITE_URL = 'https://sunkara1111.github.io/aetherline/';
const OG_IMAGE = 'https://sunkara1111.github.io/aetherline/og-image.png';
const TITLE = 'Aetherline - Industrial Signal Narrative Workbench | Real-Time Automation Monitoring';
const DESCRIPTION =
  'Aetherline: Modern industrial automation monitoring platform with real-time signal visualization, intelligent alarm pattern recognition, automated response procedures, and compliance logging for automation engineers.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'Aetherline',
  authors: [{ name: 'Dineshgopi Sunkara' }],
  creator: 'Dineshgopi Sunkara',
  publisher: 'Dineshgopi Sunkara',
  keywords: [
    'Aetherline',
    'industrial automation',
    'signal monitoring',
    'real-time visualization',
    'alarm management',
    'SCADA',
    'process control',
    'automation engineering',
    'signal intelligence',
    'industrial IoT',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Aetherline - Industrial Signal Narrative Workbench',
    description:
      'Real-time signal visualization, intelligent alarm pattern recognition, and automated response procedures for modern automation engineers.',
    url: SITE_URL,
    siteName: 'Aetherline',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Aetherline — Industrial Signal Narrative Workbench by Dineshgopi Sunkara',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aetherline - Industrial Signal Narrative Workbench',
    description: 'Real-time signal visualization and intelligent alarm management for automation engineers.',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: 'https://sunkara1111.github.io/aetherline/favicon.svg', type: 'image/svg+xml' },
      { url: 'https://sunkara1111.github.io/aetherline/favicon.ico' },
    ],
    apple: [{ url: 'https://sunkara1111.github.io/aetherline/apple-touch-icon.png', sizes: '180x180' }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Aetherline',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description: DESCRIPTION,
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  author: {
    '@type': 'Person',
    name: 'Dineshgopi Sunkara',
    jobTitle: 'Senior Controls Engineer · Automation Engineer',
  },
  creator: {
    '@type': 'Person',
    name: 'Dineshgopi Sunkara',
    jobTitle: 'Senior Controls Engineer · Automation Engineer',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
