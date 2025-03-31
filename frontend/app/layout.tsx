'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './providers/ThemeProvider';

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
      <body className={`${inter.className} transition-colors duration-200 dark:bg-gray-900`}>
        <ThemeProvider>
          {!isAdminRoute && <Navbar />}
          <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
              {children}
            </div>
            {!isAdminRoute && <Footer />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
