import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/authService';

type Role = 'consumer' | 'vendor' | 'admin' | 'delivery_boy' | 'superadmin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessName?: string;
  pricePerCan?: number;
  deliveryBaseFee?: number;
  deliveryPerKmFee?: number;
  description?: string;
  profilePic?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  demoSignIn: (role: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        
        // Optionally validate token with backend
        const me = await authService.getMe();
        if (me) {
          setUser(me);
          await AsyncStorage.setItem('user', JSON.stringify(me));
        }
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
  };

  const demoSignIn = async (role: string) => {
    const result = await authService.demoLogin(role);
    setUser(result.user);
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authService.getMe();
      if (me) {
        setUser(me);
        await AsyncStorage.setItem('user', JSON.stringify(me));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  const updateProfile = async (data: any) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, demoSignIn, signOut, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
