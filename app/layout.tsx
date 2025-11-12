/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LayoutProvider } from './components/layout/LayoutProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pick-n-Get - Sustainable Recycling Made Easy',
  description: 'Join the circular economy revolution with Pick-n-Get.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  );
}
