import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pactroom.dev'),
  title: {
    default: 'PactRoom | Cross-Machine API Contract & Breaking-Change Negotiator',
    template: '%s | PactRoom'
  },
  description:
    'PactRoom connects local backend and frontend coding agents inside a shared Switch room. Proactively detects, verifies with real compilers, and auto-patches breaking API changes across uncommitted local branches before code reaches CI.',
  keywords: [
    'Switch Protocol',
    'AI Coding Agents',
    'Cross-Machine Agent Mesh',
    'API Contracts',
    'OpenAPI 3.1',
    'TypeScript AST',
    'Contract Testing',
    'Fastify',
    'Vitest',
    'Flip the Switch Hackathon'
  ],
  authors: [{ name: 'Abhay Gupta', url: 'https://github.com/abhayguptas/pactroom' }],
  creator: 'Abhay Gupta',
  publisher: 'PactRoom',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pactroom.dev',
    title: 'PactRoom | Cross-Machine API Contract & Breaking-Change Negotiator',
    description:
      'Stop breaking frontend builds from uncommitted backend branches. The official Switch room template connecting Machine A and Machine B coding agents into a synchronized consensus mesh.',
    siteName: 'PactRoom',
    images: [
      {
        url: '/docs/assets/pactroom-logo.svg',
        width: 1200,
        height: 630,
        alt: 'PactRoom Cross-Machine Agent Mesh'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PactRoom | Cross-Machine API Contract & Breaking-Change Negotiator',
    description:
      'Stop breaking frontend builds from uncommitted backend branches. Connected local coding agents over the Switch Agent Protocol.',
    creator: '@siddhiguptas',
    images: ['/docs/assets/pactroom-logo.svg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PactRoom',
  operatingSystem: 'Cross-platform (macOS, Linux, Windows)',
  applicationCategory: 'DeveloperApplication',
  description:
    'Cross-machine API contract and breaking-change negotiator for Switch rooms.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#FAFAF8] text-neutral-900 antialiased selection:bg-orange-500/15 selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}
