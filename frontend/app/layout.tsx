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
        <footer className="bg-gray-800 text-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h3 className="text-xl font-bold">Learning Platform</h3>
                <p className="mt-2 text-gray-300">
                  Empowering learners worldwide
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <h4 className="text-lg font-semibold">Quick Links</h4>
                <ul className="mt-2 space-y-2">
                  <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
                  <li><a href="/contact" className="text-gray-300 hover:text-white">Contact</a></li>
                  <li><a href="/terms" className="text-gray-300 hover:text-white">Terms of Service</a></li>
                  <li><a href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Learning Platform. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
