
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, featureName, showAuthModal, setShowAuthModal } = useAuth();

  // Use the context's modal state instead of props
  const modalOpen = showAuthModal;
  const handleClose = () => setShowAuthModal(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen) {
      setEmail('');
      setPassword('');
      setName('');
      setActiveTab('signin');
    }
  }, [modalOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);
    
    try {
      const user = await signIn(email, password);
      if (user) {
        handleClose();
        toast.success("Signed in successfully!");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    try {
      await signUp(email, password, name);
      // Don't close modal - user should verify email
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      // Modal will close automatically on redirect
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  const modalTitle = featureName 
    ? `Sign in to access ${featureName}` 
    : 'Sign In';
  
  const modalDescription = featureName 
    ? 'You need to be signed in to use this feature.' 
    : 'Sign in to your account to access all features.';

  return (
    <Dialog open={modalOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6 max-w-[90vw] w-full">
        {featureName && (
          <div className="mb-4 text-center">
            <h3 className="text-lg font-medium mb-2 text-saboris-gray">{modalTitle}</h3>
            <p className="text-sm text-saboris-gray">{modalDescription}</p>
          </div>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-0">
            <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input 
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="h-9 sm:h-10"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input 
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="h-9 sm:h-10"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-saboris-primary text-white hover:bg-saboris-primary/90 h-9 sm:h-10 mt-2"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleGoogleAuth}
                className="w-full h-9 sm:h-10" 
                disabled={loading}
              >
                <img 
                  src="/lovable-uploads/81b9365f-22f1-4778-aaab-1fa027d316c1.png" 
                  alt="Google" 
                  className="mr-2 h-4 w-4" 
                />
                Google
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input 
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  disabled={loading}
                  className="h-9 sm:h-10"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="h-9 sm:h-10"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="h-9 sm:h-10"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-saboris-primary text-white hover:bg-saboris-primary/90 h-9 sm:h-10 mt-2"
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
              
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleGoogleAuth}
                className="w-full h-9 sm:h-10" 
                disabled={loading}
              >
                <img 
                  src="/lovable-uploads/81b9365f-22f1-4778-aaab-1fa027d316c1.png" 
                  alt="Google" 
                  className="mr-2 h-4 w-4" 
                />
                Google
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-3 sm:mt-4 px-2">
                By signing up, you agree to our <a href="/terms" className="text-saboris-primary hover:underline">Terms & Conditions</a>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
