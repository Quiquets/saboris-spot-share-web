
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

const AddPlacePage = () => {
  useEffect(() => {
    document.title = 'Saboris - Add Place';
  }, []);

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
            
            <form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">Place Name</label>
                <Input id="name" placeholder="e.g. Sushi Nakazawa" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="location" className="block font-medium">Location</label>
                <Input id="location" placeholder="Address or location" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium">Description</label>
                <textarea 
                  id="description" 
                  className="w-full rounded-md border border-input px-3 py-2 min-h-[100px]"
                  placeholder="What makes this place special?"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="tags" className="block font-medium">Tags</label>
                <Input id="tags" placeholder="e.g. sushi, japanese, expensive" />
                <p className="text-sm text-gray-500">Separate tags with commas</p>
              </div>
              
              <Button type="submit" className="w-full bg-saboris-primary hover:bg-saboris-primary/90">
                Add Place
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
