'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAdminRoute && <Navbar />}
        {children}
      </body>
    </html>
  );
}
