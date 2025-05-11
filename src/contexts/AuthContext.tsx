
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, supabaseService } from '@/services/supabaseService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  authUser: AuthUser | null;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser | null>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setAuthUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          // Fetch profile data after auth state changes
          setTimeout(async () => {
            const profile = await supabaseService.getUserProfile(currentSession.user.id);
            setUser(profile);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setAuthUser(data.session?.user || null);
        
        if (data.session?.user) {
          const profile = await supabaseService.getUserProfile(data.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    authUser,
    session,
    user,
    loading,
    signIn: supabaseService.signIn,
    signUp: supabaseService.signUp,
    signInWithGoogle: () => supabaseService.signInWithProvider('google'),
    signOut: async () => {
      await supabaseService.signOut();
      navigate('/');
    },
  };

  return (
    <AuthContext.Provider value={value}>
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
