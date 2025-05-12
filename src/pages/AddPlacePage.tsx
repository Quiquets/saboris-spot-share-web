import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formSchema, FormValues } from '@/types/place';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PlusCircle } from 'lucide-react';
import { MultiSelect } from '@/components/places/MultiSelect';
import { PriceRangeSelector } from '@/components/places/PriceRangeSelector';
import { ImageUpload } from '@/components/places/ImageUpload';
import { PlaceDetails } from '@/types/place';

const AddPlacePage = () => {
  const navigate = useNavigate();
  const { user, showAuthModal, setShowAuthModal } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      place_name: "",
      address: "",
      lat: 0,
      lng: 0,
      place_id: "",
      place_type: "restaurant",
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
    setValue("place_name", details.name);
    setValue("address", details.address);
    setValue("lat", details.lat);
    setValue("lng", details.lng);
    setValue("place_id", details.place_id);
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <PlaceSearch onPlaceSelect={handlePlaceSelect} />
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="place_type">Place Type</Label>
                <Select onValueChange={(value) => setValue("place_type", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                  </SelectContent>
                </Select>
                {errors.place_type && (
                  <p className="text-red-500 text-sm">{errors.place_type.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_food">Food Rating</Label>
                <Input
                  type="number"
                  id="rating_food"
                  defaultValue={3}
                  {...register("rating_food", { valueAsNumber: true })}
                />
                {errors.rating_food && (
                  <p className="text-red-500 text-sm">{errors.rating_food.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_service">Service Rating</Label>
                <Input
                  type="number"
                  id="rating_service"
                  defaultValue={3}
                  {...register("rating_service", { valueAsNumber: true })}
                />
                {errors.rating_service && (
                  <p className="text-red-500 text-sm">{errors.rating_service.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_atmosphere">Atmosphere Rating</Label>
                <Input
                  type="number"
                  id="rating_atmosphere"
                  defaultValue={3}
                  {...register("rating_atmosphere", { valueAsNumber: true })}
                />
                {errors.rating_atmosphere && (
                  <p className="text-red-500 text-sm">{errors.rating_atmosphere.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="rating_value">Value Rating</Label>
                <Input
                  type="number"
                  id="rating_value"
                  defaultValue={3}
                  {...register("rating_value", { valueAsNumber: true })}
                />
                {errors.rating_value && (
                  <p className="text-red-500 text-sm">{errors.rating_value.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  type="text"
                  id="cuisine"
                  placeholder="e.g., Italian, Mexican"
                  {...register("cuisine")}
                />
                {errors.cuisine && (
                  <p className="text-red-500 text-sm">{errors.cuisine.message}</p>
                )}
              </div>
              
              <PriceRangeSelector 
                value={formValues.price_range}
                onChange={(price) => setValue("price_range", price)}
              />
              
              <div>
                <Label>Occasions</Label>
                <MultiSelect 
                  options={[
                    { value: "breakfast", label: "Breakfast" },
                    { value: "brunch", label: "Brunch" },
                    { value: "lunch", label: "Lunch" },
                    { value: "dinner", label: "Dinner" },
                  ]}
                  onChange={(values) => setValue("occasions", values)}
                />
              </div>
              
              <div>
                <Label>Vibes</Label>
                <MultiSelect 
                  options={[
                    { value: "romantic", label: "Romantic" },
                    { value: "casual", label: "Casual" },
                    { value: "lively", label: "Lively" },
                  ]}
                  onChange={(values) => setValue("vibes", values)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Share your experience..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="ordered_items">Ordered Items</Label>
                <Input
                  type="text"
                  id="ordered_items"
                  placeholder="e.g., Pizza, Pasta"
                  {...register("ordered_items")}
                />
                {errors.ordered_items && (
                  <p className="text-red-500 text-sm">{errors.ordered_items.message}</p>
                )}
              </div>
              
              <div>
                <Label>Photo Uploads</Label>
                <ImageUpload 
                  images={formValues.photo_urls}
                  onChange={(urls) => setValue("photo_urls", urls)}
                  maxImages={5}
                />
              </div>
              
              <div>
                <Label htmlFor="tagged_friends">Tagged Friends</Label>
                <Input
                  type="text"
                  id="tagged_friends"
                  placeholder="e.g., @friend1, @friend2"
                  {...register("tagged_friends")}
                />
                {errors.tagged_friends && (
                  <p className="text-red-500 text-sm">{errors.tagged_friends.message}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_public"
                  defaultChecked
                  {...register("is_public")}
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

interface PlaceSearchProps {
  onPlaceSelect: (details: PlaceDetails) => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ onPlaceSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  
  useEffect(() => {
    // Load Google Maps API and Autocomplete Service
    if (!window.google) {
      console.error("Google Maps API not loaded");
      return;
    }
    
    setAutocompleteService(new window.google.maps.places.AutocompleteService());
  }, []);
  
  useEffect(() => {
    if (!searchQuery || !autocompleteService) {
      setSearchResults([]);
      return;
    }
    
    autocompleteService.getPlacePredictions({
      input: searchQuery,
      types: ['establishment'],
    }, (predictions) => {
      setSearchResults(predictions || []);
    });
  }, [searchQuery, autocompleteService]);
  
  const handlePlaceSelect = (placeId: string) => {
    if (!window.google) {
      console.error("Google Maps API not loaded");
      return;
    }
    
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    placesService.getDetails({
      placeId: placeId,
      fields: ['name', 'address_components', 'geometry', 'place_id'],
    }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const address = place.address_components?.map(component => component.long_name).join(', ') || 'Address not found';
        
        const details: PlaceDetails = {
          name: place.name || 'Name not found',
          address: address,
          lat: place.geometry?.location?.lat() || 0,
          lng: place.geometry?.location?.lng() || 0,
          place_id: place.place_id || 'Place ID not found',
        };
        
        onPlaceSelect(details);
        setSearchQuery('');
        setSearchResults([]);
      } else {
        console.error('Could not retrieve place details:', status);
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <Label htmlFor="search">Find a Place</Label>
      <Input
        type="text"
        id="search"
        placeholder="Enter a place name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {searchResults.length > 0 && (
        <ul className="border rounded-md bg-white shadow-md max-h-48 overflow-y-auto">
          {searchResults.map((result) => (
            <li
              key={result.place_id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handlePlaceSelect(result.place_id)}
            >
              {result.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const useFormValues = <T extends Record<string, any>>(defaultValues: T) => {
  const [values, setValues] = useState<T>(defaultValues);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = event.target;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return {
    values,
    handleChange,
    setValue: (name: string, value: any) => {
      setValues(prevValues => ({
        ...prevValues,
        [name]: value
      }));
    }
  };
};

export default AddPlacePage;
