
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Form } from '@/components/ui/form';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Import custom components
import { PlaceInformationSection } from '@/components/places/PlaceInformationSection';
import { PlaceDetailsSection } from '@/components/places/PlaceDetailsSection';
import { PlaceRatingsSection } from '@/components/places/PlaceRatingsSection';
import { PlacePhotosSection } from '@/components/places/PlacePhotosSection';
import { PlaceTagsSection } from '@/components/places/PlaceTagsSection';
import { PlaceExperienceSection } from '@/components/places/PlaceExperienceSection';
import { PlaceVisibilityToggle } from '@/components/places/PlaceVisibilityToggle';
import { FriendSelectorSection } from '@/components/places/FriendSelectorSection';
import { PlaceSubmitSection } from '@/components/places/PlaceSubmitSection';
import { loadGoogleMapsScript } from '@/utils/mapUtils';
import { filterOptions } from '@/components/map/FilterOptions';
import { formSchema, FormValues, PlaceDetails } from '@/types/place';

// Convert FilterOptions into cuisine options
const cuisineOptions = filterOptions.foodType.map(item => ({
  value: item.id,
  label: item.label.replace(/\s*🍣|🥘|🍝|🍔|☕|🌮|🥗|🍰|🍜|🥡|🥞|🦞|🍕|🍖|🥬|🥕|🫒|🥙|🥐|🍲|🍱|🧆/g, '').trim()
}));

// Occasion options
const occasionOptions = filterOptions.occasion.map(item => ({
  value: item.id,
  label: item.label
}));

// Get vibe options from filter options
const vibeOptions = filterOptions.vibe.map(item => ({
  value: item.id,
  label: item.label
}));

const AddPlacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [googleMapPhoto, setGoogleMapPhoto] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      place_name: '',
      address: '',
      lat: 0,
      lng: 0,
      place_id: '',
      place_type: 'restaurant',
      rating_food: 0,
      rating_service: 0,
      rating_atmosphere: 0,
      rating_value: 0,
      cuisine: undefined,
      price_range: '',
      occasions: [],
      vibes: [],
      description: '',
      ordered_items: '',
      photo_urls: [],
      tagged_friends: [],
      is_public: true,
    }
  });
  
  // Check if form is valid (all required fields filled)
  const isFormValid = () => {
    const values = form.getValues();
    return (
      values.place_name &&
      values.address &&
      values.lat !== 0 &&
      values.lng !== 0 &&
      values.rating_food > 0 &&
      values.rating_service > 0 &&
      values.rating_atmosphere > 0 &&
      values.rating_value > 0 &&
      values.price_range
    );
  };

  useEffect(() => {
    document.title = 'Saboris - Share a Place';
    
    // Load Google Maps API
    loadGoogleMapsScript().catch(err => {
      console.error("Error loading Google Maps:", err);
      toast.error("Failed to load location search. Please refresh and try again.");
    });
  }, []);

  const handlePlaceSelect = (placeDetails: PlaceDetails) => {
    console.log("Place selected:", placeDetails);
    form.setValue('place_name', placeDetails.name);
    form.setValue('address', placeDetails.address);
    form.setValue('lat', placeDetails.lat);
    form.setValue('lng', placeDetails.lng);
    form.setValue('place_id', placeDetails.place_id);
    
    // If we have a Google photo and no user photos yet, save it
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      setGoogleMapPhoto(placeDetails.photos[0]);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be signed in to add a place");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use Google photo if no photos were uploaded
      let finalPhotoUrls = values.photo_urls || [];
      if (finalPhotoUrls.length === 0 && googleMapPhoto) {
        finalPhotoUrls = [googleMapPhoto];
      }
      
      // 1. Insert into places table
      const { data: placeData, error: placeError } = await supabase
        .from('places')
        .insert({
          name: values.place_name,
          address: values.address,
          lat: values.lat,
          lng: values.lng,
          category: values.place_type,
          description: values.description || '',
          tags: values.occasions || [],
          vibes: values.vibes || [],
          created_by: user.id
        })
        .select()
        .single();
        
      if (placeError) throw placeError;
      
      // 2. Insert into reviews table
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          place_id: placeData.id,
          rating_food: values.rating_food,
          rating_service: values.rating_service,
          rating_atmosphere: values.rating_atmosphere,
          rating_value: values.rating_value,
          text: values.description,
          photo_url: finalPhotoUrls.length > 0 ? finalPhotoUrls[0] : null
        })
        .select()
        .single();
      
      if (reviewError) throw reviewError;
      
      // 3. Add to user's wishlist
      await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          place_id: placeData.id,
          note: `${values.price_range} · ${values.description || 'No description'}`
        });
      
      // 4. Share with selected friends if any
      if (values.tagged_friends && values.tagged_friends.length > 0) {
        const notifications = values.tagged_friends.map(friendId => ({
          user_id: friendId,
          sender_id: user.id,
          place_id: placeData.id,
          type: 'place_share'
        }));
        
        await supabase.from('notifications').insert(notifications);
      }
      
      toast.success("Place added and shared successfully!");
      
      // Show friend selector if not shown, otherwise navigate to profile
      if (showFriendSelector) {
        navigate('/profile');
      } else {
        setShowFriendSelector(true);
        setIsSubmitting(false);
      }
      
    } catch (error: any) {
      console.error("Error adding place:", error);
      toast.error(error.message || "Failed to add place");
      setIsSubmitting(false);
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
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow w-full px-4 py-12 max-w-[1440px] mx-auto">
        <div className="mx-auto">
          <div className="flex items-center mb-8 gap-3">
            <Sparkles className="text-saboris-primary h-7 w-7" />
            <h1 className="text-3xl font-bold">Share Your Experience</h1>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Content in a two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Basic info */}
                <div className="lg:col-span-1 space-y-8">
                  <PlaceInformationSection 
                    form={form} 
                    handlePlaceSelect={handlePlaceSelect}
                    isSubmitting={isSubmitting}
                  />
                  
                  <PlaceDetailsSection 
                    form={form} 
                    cuisineOptions={cuisineOptions} 
                  />
                </div>

                {/* Center column - Ratings & Photos */}
                <div className="lg:col-span-1 space-y-8">
                  <PlaceRatingsSection form={form} />
                  
                  <PlacePhotosSection form={form} googleMapPhoto={googleMapPhoto} />
                </div>

                {/* Right column - Tags & Experience */}
                <div className="lg:col-span-1 space-y-8">
                  <PlaceTagsSection 
                    form={form} 
                    occasionOptions={occasionOptions} 
                    vibeOptions={vibeOptions} 
                  />
                  
                  <PlaceExperienceSection form={form} isSubmitting={isSubmitting} />
                  
                  <PlaceVisibilityToggle form={form} isSubmitting={isSubmitting} />
                </div>
              </div>
              
              {/* Friend Selection (Only show after submission) */}
              {showFriendSelector && (
                <FriendSelectorSection form={form} />
              )}
              
              {/* Submit Button */}
              <PlaceSubmitSection 
                form={form} 
                isSubmitting={isSubmitting} 
                showFriendSelector={showFriendSelector}
                isFormValid={isFormValid}
              />
            </form>
          </Form>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default AddPlacePage;
