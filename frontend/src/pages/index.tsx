import React from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  // Redirect helper function
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'vendor':
        return '/vendor/dashboard';
      case 'delivery':
        return '/delivery/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <Layout title="Home">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Real-Time Location Tracker for Multivendor Delivery
              </h1>
              <p className="text-xl mb-8">
                A complete solution for vendors, delivery partners, and customers to track deliveries in real-time.
              </p>
              <Link href={getDashboardLink()} className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg">
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/location-tracking.svg" 
                alt="Location Tracking" 
                className="w-full max-w-md mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "https://via.placeholder.com/600x400?text=Location+Tracking";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="text-primary-600 text-5xl mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Vendors</h3>
            <p className="text-gray-600">
              Manage orders and assign delivery partners. Get real-time updates on delivery status.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-primary-600 text-5xl mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Delivery Partners</h3>
            <p className="text-gray-600">
              Receive order assignments, start tracking, and update your location in real-time.
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-primary-600 text-5xl mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">For Customers</h3>
            <p className="text-gray-600">
              Track your orders in real-time on a map. Know exactly when your delivery will arrive.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
