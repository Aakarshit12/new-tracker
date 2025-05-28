import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // If roles are specified and user role is not allowed, redirect to appropriate dashboard
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        switch (user.role) {
          case 'vendor':
            router.push('/vendor/dashboard');
            break;
          case 'delivery':
            router.push('/delivery/dashboard');
            break;
          case 'customer':
            router.push('/customer/dashboard');
            break;
          default:
            router.push('/');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show nothing while checking authentication
  if (loading || !user) {
    return null;
  }

  // If roles are specified and user is not allowed, show nothing
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  // If authenticated and authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;
