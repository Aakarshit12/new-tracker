import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'vendor' | 'delivery' | 'customer';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, config);
          
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('token', response.data.data.token);
        
        // Redirect based on user role
        switch (response.data.data.user.role) {
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (name: string, email: string, password: string, role: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        name,
        email,
        password,
        role
      });
      
      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('token', response.data.data.token);
        
        // Redirect based on user role
        switch (response.data.data.user.role) {
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
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
