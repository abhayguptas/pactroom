import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PactRoom | Cross-Machine API Contract & Breaking-Change Negotiator',
  description:
    'Flip the Switch Hackathon (Business Workflow Track). Bridges local backend and frontend coding agents inside a shared Switch room to detect, verify, negotiate, and auto-patch breaking API changes across uncommitted local branches.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAF8] text-neutral-900 antialiased selection:bg-orange-500/15 selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}

