import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, extras?: { phone?: string; dateOfBirth?: string; education?: { degree?: string; college?: string } }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: try to restore session from token
  useEffect(() => {
    AuthService.getCurrentUser()
      .then((userProfile) => {
        setProfile(userProfile);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const userProfile = await AuthService.login(email, password);
    setProfile(userProfile);
  };

  const register = async (name: string, email: string, password: string, extras?: { phone?: string; dateOfBirth?: string; education?: { degree?: string; college?: string } }) => {
    const userProfile = await AuthService.register(name, email, password, extras);
    setProfile(userProfile);
  };

  const logout = () => {
    AuthService.logout();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (profile) {
      const updated = await AuthService.getUserProfile(profile.uid);
      setProfile(updated);
    }
  };

  const isAdmin = profile?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ profile, loading, isAdmin, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
