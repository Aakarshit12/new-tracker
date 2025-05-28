import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title = 'Location Tracker' }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      <Head>
        <title>{title} | Real-Time Location Tracker</title>
        <meta name="description" content="Real-Time Location Tracker for Multivendor Delivery Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-primary-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              LocationTracker
            </Link>

            <nav>
              <ul className="flex items-center space-x-6">
                {user ? (
                  <>
                    <li>
                      <span className="font-medium">
                        Welcome, {user.name}
                      </span>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="bg-white text-primary-600 px-4 py-2 rounded hover:bg-gray-100 transition"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="hover:underline">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="bg-white text-primary-600 px-4 py-2 rounded hover:bg-gray-100 transition">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Real-Time Location Tracker. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
