
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, supabaseService } from '@/services/supabaseService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    console.log("Setting up auth state listener");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        
        // Update session and user synchronously
        setSession(currentSession);
        setAuthUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          // Defer profile fetch to avoid auth deadlock
          setTimeout(async () => {
            try {
              console.log("Fetching user profile...");
              const profile = await supabaseService.getUserProfile(currentSession.user.id);
              setUser(profile);
              
              // Handle redirect after login
              if (event === 'SIGNED_IN') {
                console.log("Handling redirect after login");
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                  localStorage.removeItem('redirectAfterLogin');
                  navigate(redirectPath);
                } else {
                  // Default redirect if no saved path
                  navigate('/profile');
                }
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setAuthUser(data.session?.user || null);
        
        if (data.session?.user) {
          const profile = await supabaseService.getUserProfile(data.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Authentication error. Please try signing in again.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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
