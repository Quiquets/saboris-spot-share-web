
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin, PlusCircle, Share } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import custom components
import { PlaceAutocomplete } from '@/components/places/PlaceAutocomplete';
import { PlaceTypeToggle } from '@/components/places/PlaceTypeToggle';
import { StarRating } from '@/components/places/StarRating';
import { PriceRangeSelector } from '@/components/places/PriceRangeSelector';
import { TagSelector } from '@/components/places/TagSelector';
import { ImageUpload } from '@/components/places/ImageUpload';
import { FriendSelector } from '@/components/places/FriendSelector';

// Form schema with Zod validation
const formSchema = z.object({
  place_name: z.string().min(1, "Place name is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string(),
  place_type: z.enum(["restaurant", "bar"]),
  rating_food: z.number().min(1, "Food rating is required"),
  rating_service: z.number().min(1, "Service rating is required"),
  rating_atmosphere: z.number().min(1, "Atmosphere rating is required"),
  rating_value: z.number().min(1, "Value rating is required"),
  cuisine: z.string().optional(),
  price_range: z.string().min(1, "Price range is required"),
  occasions: z.array(z.string()).optional(),
  description: z.string().optional(),
  ordered_items: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
  tagged_friends: z.array(z.string()).optional(),
  is_public: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Cuisine options
const cuisineOptions = [
  "American", "Italian", "Mexican", "Chinese", "Japanese", "Thai", 
  "Indian", "French", "Mediterranean", "Greek", "Spanish", "Korean", 
  "Vietnamese", "Middle Eastern", "African", "Caribbean", "Fusion", 
  "Seafood", "Steakhouse", "Vegetarian", "Vegan", "Bakery", "Dessert", "Other"
];

// Occasion options
const occasionOptions = [
  "Breakfast", "Brunch", "Lunch", "Dinner",
  "Casual Date", "Special Occasion", "Family Visit", 
  "Friends Night Out", "Work Lunch", "Business Dinner",
  "Quick Bite", "Late Night", "Drinks Only"
];

const AddPlacePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  
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
    
    // Load Google Maps JavaScript API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBB9B-Rk8go54u0Ty2z-gNS-P5_NaBcAzw&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handlePlaceSelect = (placeDetails: any) => {
    form.setValue('place_name', placeDetails.name);
    form.setValue('address', placeDetails.address);
    form.setValue('lat', placeDetails.lat);
    form.setValue('lng', placeDetails.lng);
    form.setValue('place_id', placeDetails.place_id);
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be signed in to add a place");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
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
          text: values.description,
          photo_url: values.photo_urls && values.photo_urls.length > 0 ? values.photo_urls[0] : null
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
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8 gap-2">
            <PlusCircle className="text-saboris-primary h-6 w-6" />
            <h1 className="text-3xl font-bold">Share a Place</h1>
          </div>
          
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Place Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Place Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="place_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place Name</FormLabel>
                        <FormControl>
                          <PlaceAutocomplete 
                            value={field.value}
                            onPlaceSelect={handlePlaceSelect}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field}
                              placeholder="Address will be filled automatically"
                              disabled={true}
                              className="bg-gray-50"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="place_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place Type</FormLabel>
                        <FormControl>
                          <PlaceTypeToggle
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Ratings Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Ratings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="rating_food"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <StarRating
                              label="Food Quality"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rating_service"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <StarRating
                              label="Service"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rating_atmosphere"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <StarRating
                              label="Atmosphere"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rating_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <StarRating
                              label="Value for Money"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a cuisine" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                {cuisineOptions.map(cuisine => (
                                  <SelectItem key={cuisine} value={cuisine}>
                                    {cuisine}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <PriceRangeSelector
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="occasions"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <TagSelector
                            label="Occasion"
                            options={occasionOptions}
                            selectedTags={field.value || []}
                            onChange={field.onChange}
                            maxSelection={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Additional Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Additional Information</h2>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What made this place special?</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share your experience..."
                            className="min-h-[100px]"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ordered_items"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What did you order?</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="List the dishes you tried..."
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="photo_urls"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload
                            images={field.value || []}
                            onChange={field.onChange}
                            maxImages={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Post Visibility</FormLabel>
                          <p className="text-sm text-gray-500">
                            {field.value ? "Visible to everyone" : "Visible only to your followers"}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Friend Selection (Only show after submission) */}
                {showFriendSelector && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Share with Friends</h2>
                    
                    <FormField
                      control={form.control}
                      name="tagged_friends"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FriendSelector
                              selectedFriends={field.value || []}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-saboris-primary hover:bg-saboris-primary/90"
                  disabled={isSubmitting || (!showFriendSelector && !isFormValid())}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {showFriendSelector ? "Sharing..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      {showFriendSelector ? (
                        <>
                          <Share className="mr-2 h-4 w-4" />
                          Share with your friends!
                        </>
                      ) : (
                        'Add Place'
                      )}
                    </>
                  )}
                </Button>
                
                {showFriendSelector && (
                  <div className="text-center text-sm text-gray-500">
                    or{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/profile')}
                      className="text-saboris-primary hover:underline"
                    >
                      Skip this step
                    </button>
                  </div>
                )}
              </form>
            </Form>
          </Card>
        </div>
      </div>
      
      <Footer />
    </main>
  );
};

export default AddPlacePage;
