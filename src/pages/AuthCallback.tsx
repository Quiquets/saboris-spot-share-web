
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/');
          return;
        }

        if (data.session) {
          console.log('Authentication successful');
          
          // Check for redirect path
          const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');
          
          navigate(redirectPath);
        } else {
          console.log('No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast.error('An unexpected error occurred. Please try again.');
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saboris-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
