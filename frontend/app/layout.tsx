'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { MessagesProvider } from '@/context/MessagesContext';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import FloatingChatBot from '@/components/FloatingChatBot';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <MessagesProvider>
            {!isAdminRoute && <Navbar />}
            <main className="flex-grow">{children}</main>
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <FloatingChatBot />}
            <Toaster />
          </MessagesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
