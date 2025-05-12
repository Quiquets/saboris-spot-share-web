import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formSchema, FormValues, PlaceDetails } from '@/types/place';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlaceAutocomplete } from '@/components/places/PlaceAutocomplete';
import { PriceRangeSelector } from '@/components/places/PriceRangeSelector';
import { ImageUpload } from '@/components/places/ImageUpload';
import { loadGoogleMapsScript } from '@/utils/mapUtils';
import { SelectDropdown } from '@/components/places/SelectDropdown';

// Define place types as a constant array to avoid recursive typing issues
const PLACE_TYPES = ["restaurant", "bar", "cafe"] as const;
type PlaceType = typeof PLACE_TYPES[number];

const AddPlacePage = () => {
  const navigate = useNavigate();
  const { user, showAuthModal, setShowAuthModal } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await loadGoogleMapsScript();
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    
    loadGoogleMaps();
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      place_name: "",
      address: "",
      lat: 0,
      lng: 0,
      place_id: "",
      place_type: "restaurant" as PlaceType,
      rating_food: 3,
      rating_service: 3,
      rating_atmosphere: 3,
      rating_value: 3,
      cuisine: "",
      price_range: "$",
      occasions: [],
      vibes: [],
      description: "",
      ordered_items: "",
      photo_urls: [],
      tagged_friends: [],
      is_public: true,
    }
  });
  
  // Extract form state and values
  const { watch } = form;
  const formValues = watch();
  
  useEffect(() => {
    document.title = 'Saboris - Share Your Experience';
    
    // Check if user is authenticated
    if (!user) {
      // Store the current path in localStorage
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      // Show the authentication modal
      setShowAuthModal(true);
    }
  }, [user, setShowAuthModal]);
  
  const handlePlaceSelect = (details: PlaceDetails) => {
    setPlaceDetails(details);
    form.setValue("place_name", details.name);
    form.setValue("address", details.address);
    form.setValue("lat", details.lat);
    form.setValue("lng", details.lng);
    form.setValue("place_id", details.place_id);
    setStep(2);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Check if the place already exists
      let { data: existingPlace, error: placeError } = await supabase
        .from('places')
        .select('id')
        .eq('place_id', data.place_id)
        .single();
      
      if (placeError && placeError.code !== '404') {
        throw placeError;
      }
      
      let placeId;
      
      if (existingPlace) {
        // Use the existing place ID
        placeId = existingPlace.id;
      } else {
        // 2. If the place doesn't exist, create it
        let { data: newPlace, error: newPlaceError } = await supabase
          .from('places')
          .insert({
            google_place_id: data.place_id,
            lat: data.lat,
            lng: data.lng,
            name: data.place_name,
            address: data.address,
            category: data.place_type,
          })
          .select('id')
          .single();
        
        if (newPlaceError) {
          throw newPlaceError;
        }
        
        placeId = newPlace.id;
      }
      
      // 3. Create the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          place_id: placeId,
          user_id: user.id,
          rating_food: data.rating_food,
          rating_service: data.rating_service,
          rating_atmosphere: data.rating_atmosphere,
          rating_value: data.rating_value,
          text: data.description,
          photo_urls: data.photo_urls,
        });
      
      if (reviewError) {
        throw reviewError;
      }
      
      toast({
        title: "Success!",
        description: "Your review has been submitted.",
      })
      
      navigate('/profile');
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Step progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <div className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Find Place</span>
            </div>
            <div className="step-divider"></div>
            <div className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Add Review</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label htmlFor="search">Find a Place</Label>
              {isGoogleMapsLoaded ? (
                <PlaceAutocomplete
                  value={formValues.place_name}
                  onPlaceSelect={handlePlaceSelect}
                  disabled={isSubmitting}
                />
              ) : (
                <div className="flex items-center justify-center p-6 border rounded-md">
                  <p>Loading Google Maps...</p>
                </div>
              )}
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="place_type">Place Type</Label>
                <Select 
                  onValueChange={(value) => {
                    if (PLACE_TYPES.includes(value as PlaceType)) {
                      form.setValue("place_type", value as PlaceType);
                    }
                  }}
                  defaultValue={formValues.place_type}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.place_type && (
                  <p className="text-red-500 text-sm">{form.formState.errors.place_type.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_food">Food Rating</Label>
                <Input
                  type="number"
                  id="rating_food"
                  defaultValue={3}
                  {...form.register("rating_food", { valueAsNumber: true })}
                />
                {form.formState.errors.rating_food && (
                  <p className="text-red-500 text-sm">{form.formState.errors.rating_food.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_service">Service Rating</Label>
                <Input
                  type="number"
                  id="rating_service"
                  defaultValue={3}
                  {...form.register("rating_service", { valueAsNumber: true })}
                />
                {form.formState.errors.rating_service && (
                  <p className="text-red-500 text-sm">{form.formState.errors.rating_service.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_atmosphere">Atmosphere Rating</Label>
                <Input
                  type="number"
                  id="rating_atmosphere"
                  defaultValue={3}
                  {...form.register("rating_atmosphere", { valueAsNumber: true })}
                />
                {form.formState.errors.rating_atmosphere && (
                  <p className="text-red-500 text-sm">{form.formState.errors.rating_atmosphere.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_value">Value Rating</Label>
                <Input
                  type="number"
                  id="rating_value"
                  defaultValue={3}
                  {...form.register("rating_value", { valueAsNumber: true })}
                />
                {form.formState.errors.rating_value && (
                  <p className="text-red-500 text-sm">{form.formState.errors.rating_value.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  type="text"
                  id="cuisine"
                  placeholder="e.g., Italian, Mexican"
                  {...form.register("cuisine")}
                />
                {form.formState.errors.cuisine && (
                  <p className="text-red-500 text-sm">{form.formState.errors.cuisine.message}</p>
                )}
              </div>
              
              <PriceRangeSelector 
                value={formValues.price_range}
                onChange={(price) => form.setValue("price_range", price)}
              />
              
              <div>
                <Label>Occasions</Label>
                <SelectDropdown 
                  options={[
                    { value: "breakfast", label: "Breakfast" },
                    { value: "brunch", label: "Brunch" },
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                  ]}
                  value={formValues.occasions}
                  onChange={(values) => form.setValue("occasions", values)}
                  placeholder="Select occasions..."
                  label="Occasions"
                />
              </div>
              
              <div>
                <Label>Vibes</Label>
                <SelectDropdown 
                  options={[
                    { value: "romantic", label: "Romantic" },
                    { value: "casual", label: "Casual" },
                    { value: "lively", label: "Lively" },
                  ]}
                  value={formValues.vibes}
                  onChange={(values) => form.setValue("vibes", values)}
                  placeholder="Select vibes..."
                  label="Vibes"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Share your experience..."
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="ordered_items">Ordered Items</Label>
                <Input
                  type="text"
                  id="ordered_items"
                  placeholder="e.g., Pizza, Pasta"
                  {...form.register("ordered_items")}
                />
                {form.formState.errors.ordered_items && (
                  <p className="text-red-500 text-sm">{form.formState.errors.ordered_items.message}</p>
                )}
              </div>
              
              <div>
                <Label>Photo Uploads</Label>
                <ImageUpload 
                  images={formValues.photo_urls}
                  onChange={(urls) => form.setValue("photo_urls", urls)}
                  maxImages={5}
                />
              </div>
              
              <div>
                <Label htmlFor="tagged_friends">Tagged Friends</Label>
                <Input
                  type="text"
                  id="tagged_friends"
                  placeholder="e.g., @friend1, @friend2"
                  {...form.register("tagged_friends")}
                />
                {form.formState.errors.tagged_friends && (
                  <p className="text-red-500 text-sm">{form.formState.errors.tagged_friends.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_public"
                  checked={formValues.is_public}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      form.setValue("is_public", checked);
                    }
                  }}
                />
                <Label htmlFor="is_public">Public</Label>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            {step === 2 && (
              <Button variant="secondary" onClick={() => setStep(1)}>
                Previous
              </Button>
            )}
            {step === 1 && (
              <div></div>
            )}
            {step < 2 ? (
              <Button type="button" onClick={() => setStep(2)}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="bg-saboris-primary hover:bg-saboris-primary/90 text-white">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </form>
      </div>
      
      <Footer />
      
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <p>Please sign in to share your experience.</p>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AddPlacePage;
