
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
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  featureName?: string;
  setFeatureName: (name?: string) => void;
  savedPlaces: any[];
  userReviews: any[];
  followers: any[];
  following: any[];
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [featureName, setFeatureName] = useState<string | undefined>();
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const navigate = useNavigate();

  // Fetch user data after authentication
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch saved places
      const savedPlaces = await supabaseService.getSavedRestaurants(userId);
      setSavedPlaces(savedPlaces);
      
      // Fetch user reviews - we'll need to add this method to supabaseService
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId);
      setUserReviews(reviews || []);
      
      // Fetch followers
      const followers = await supabaseService.getFollowers(userId);
      setFollowers(followers);
      
      // Fetch following - we'll need to implement this
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id, users!follows_following_id_fkey(*)')
        .eq('follower_id', userId);
      
      const followingUsers = followingData?.map(item => ({
        ...item.users,
        email: item.users.username.includes('@') ? item.users.username : ''
      })) || [];
      
      setFollowing(followingUsers);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  // Function to refresh user data
  const refreshUserData = async () => {
    if (authUser) {
      await fetchUserData(authUser.id);
    }
  };

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
              
              // Fetch user data
              await fetchUserData(currentSession.user.id);
              
              // Handle redirect after login
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                console.log("Handling redirect after login");
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                  localStorage.removeItem('redirectAfterLogin');
                  navigate(redirectPath);
                }
                
                setShowAuthModal(false); // Close auth modal after successful login
                toast.success("Successfully signed in!");
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
              toast.error("Could not load your profile. Please try again.");
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSavedPlaces([]);
          setUserReviews([]);
          setFollowers([]);
          setFollowing([]);
          toast.info("You've been signed out");
          
          // Redirect to home page after sign out
          navigate('/');
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
          try {
            const profile = await supabaseService.getUserProfile(data.session.user.id);
            setUser(profile);
            
            // Fetch user data
            await fetchUserData(data.session.user.id);
          } catch (profileError) {
            console.error("Error fetching user profile on init:", profileError);
            // Don't throw here to prevent blocking auth initialization
          }
        }
      } catch (error: any) {
        console.error("Error fetching session:", error);
        
        // Check for specific token errors and handle appropriately
        if (error.message?.includes('invalid token') || error.message?.includes('JWT')) {
          console.log("Token error detected - clearing session data");
          // Clear any corrupted auth data
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
          toast.error("Your login session expired. Please sign in again.");
        } else {
          toast.error("Authentication error. Please try signing in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Enhanced sign in with better error handling
  const enhancedSignIn = async (email: string, password: string) => {
    try {
      const result = await supabaseService.signIn(email, password);
      if (!result) {
        toast.error("Login failed. Please check your credentials and try again.");
      }
      return result;
    } catch (error: any) {
      console.error("Enhanced sign in error:", error);
      
      // Handle specific error cases with helpful messages
      if (error.message?.includes('Email not confirmed')) {
        toast.error("Please confirm your email before signing in. Check your inbox for a verification link.");
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes('invalid token') || error.message?.includes('JWT')) {
        toast.error("Authentication error. Please try again.");
        // Clear any corrupted auth data
        await supabase.auth.signOut();
      } else {
        toast.error(`Sign in failed: ${error.message || 'Unknown error'}`);
      }
      
      return null;
    }
  };

  const value = {
    authUser,
    session,
    user,
    loading,
    signIn: enhancedSignIn,
    signUp: supabaseService.signUp,
    signInWithGoogle: () => supabaseService.signInWithProvider('google'),
    signOut: async () => {
      await supabaseService.signOut();
    },
    showAuthModal,
    setShowAuthModal,
    featureName,
    setFeatureName,
    savedPlaces,
    userReviews,
    followers,
    following,
    refreshUserData,
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
