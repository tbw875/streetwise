import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Streetwise - Seattle Transportation Projects',
    template: '%s | Streetwise',
  },
  description: 
    'Track Seattle DOT projects and suggest improvements for your neighborhood. ' +
    'View ongoing construction, propose new ideas, and engage with your community.',
  keywords: [
    'Seattle',
    'transportation',
    'SDOT',
    'road projects',
    'bike lanes',
    'pedestrian safety',
    'Vision Zero',
    'civic engagement',
  ],
  authors: [{ name: 'Streetwise' }],
  creator: 'Streetwise',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://streetwise.app',
    title: 'Streetwise - Seattle Transportation Projects',
    description: 'Track Seattle DOT projects and suggest improvements for your neighborhood.',
    siteName: 'Streetwise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streetwise - Seattle Transportation Projects',
    description: 'Track Seattle DOT projects and suggest improvements for your neighborhood.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans">
        {children}
      </body>
    </html>
  );
}
