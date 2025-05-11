
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AddPlacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    tags: '',
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    document.title = 'Saboris - Add Place';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be signed in to add a place");
      return;
    }
    
    if (!formData.name || !formData.location) {
      toast.error("Please provide a name and location");
      return;
    }
    
    setLoading(true);
    
    try {
      // For now, we'll use random coordinates near Berlin (would use geocoding in production)
      const lat = 52.52 + (Math.random() - 0.5) * 0.1;
      const lng = 13.405 + (Math.random() - 0.5) * 0.1;
      
      const tags = formData.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const { data, error } = await supabase
        .from('places')
        .insert({
          name: formData.name,
          description: formData.description,
          address: formData.location,
          lat,
          lng,
          tags,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Save the place to user's wishlist
      await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          place_id: data.id
        });
      
      toast.success("Place added successfully!");
      navigate('/profile');
    } catch (error: any) {
      console.error("Error adding place:", error);
      toast.error(error.message || "Failed to add place");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-saboris-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to add new places.</p>
            <Button onClick={() => navigate('/')} className="bg-saboris-primary hover:bg-saboris-primary/90">
              Go to Home
            </Button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }
  
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8 gap-2">
            <PlusCircle className="text-saboris-primary h-6 w-6" />
            <h1 className="text-3xl font-bold">Add New Place</h1>
          </div>
          
          <Card className="p-6">
            <p className="mb-6 text-gray-600">
              Share your favorite spots with your trusted circle. Only places you truly recommend.
            </p>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">Place Name</label>
                <Input 
                  id="name" 
                  placeholder="e.g. Sushi Nakazawa" 
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="block font-medium">Location</label>
                <Input 
                  id="location" 
                  placeholder="Address or location" 
                  value={formData.location}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium">Description</label>
                <textarea 
                  id="description" 
                  className="w-full rounded-md border border-input px-3 py-2 min-h-[100px]"
                  placeholder="What makes this place special?"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tags" className="block font-medium">Tags</label>
                <Input 
                  id="tags" 
                  placeholder="e.g. sushi, japanese, expensive" 
                  value={formData.tags}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">Separate tags with commas</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-saboris-primary hover:bg-saboris-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Place'
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default AddPlacePage;
