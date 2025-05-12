
import { supabase } from "@/integrations/supabase/client";
import { User as AuthUser, Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { User } from '../types';

class AuthService {
  async signIn(email: string, password: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return null;
      }
      
      return data.user;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
      return null;
    }
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Registration successful! Please check your email for verification.");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to sign up. Please try again.");
    }
  }

  async signInWithProvider(provider: 'google'): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error(error.message);
        return null;
      }
      
      // Fix: The OAuth call doesn't immediately return a user,
      // it redirects the browser, so we return null here
      return null;
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  }
  
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user || null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }
  
  async getCurrentSession(): Promise<any | null> {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session || null;
    } catch (error) {
      console.error("Get current session error:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
