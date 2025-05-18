import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Import custom components
import { PlaceInformationSection } from '@/components/places/PlaceInformationSection';
import { PlaceDetailsSection } from '@/components/places/PlaceDetailsSection';
import { PlaceRatingsSection } from '@/components/places/PlaceRatingsSection';
import { PlacePhotosSection } from '@/components/places/PlacePhotosSection';
import { PlaceExperienceSection } from '@/components/places/PlaceExperienceSection';
import { PlaceVisibilityToggle } from '@/components/places/PlaceVisibilityToggle';
import { FriendTagsSection } from '@/components/places/FriendTagsSection';
import { FriendSelectorSection } from '@/components/places/FriendSelectorSection';
import { PlaceSubmitSection } from '@/components/places/PlaceSubmitSection';
import { formSchema, FormValues, PlaceDetails } from '@/types/place';
import { filterOptions } from '@/components/map/FilterOptions';

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

export function AddPlaceForm() {
  const { user } = useAuth();
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
    return !!(
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

  const handlePlaceSelect = (placeDetails: PlaceDetails) => {
    console.log("Place selected:", placeDetails);
    form.setValue('place_name', placeDetails.name);
    form.setValue('address', placeDetails.address);
    form.setValue('lat', placeDetails.lat);
    form.setValue('lng', placeDetails.lng);
    form.setValue('place_id', placeDetails.place_id);
    
    // If we have a Google photo, save it
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
    // 1) Determine which photos to save
    let finalPhotoUrls = values.photo_urls?.length
      ? values.photo_urls
      : googleMapPhoto
        ? [googleMapPhoto]
        : [];

    // 2) Combine tags
    const allTags: string[] = [
      ...(values.occasions || []),
      ...(values.vibes || []),
      ...(values.cuisine ? [values.cuisine] : [])
    ];

    // 3) Insert into places
    const { data: placeData, error: placeError } = await supabase
      .from("places")
      .insert({
        name: values.place_name,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        category: values.place_type,
        description: values.description || "",
        tags: allTags,
        created_by: user.id
      })
      .select()
      .single();
    if (placeError || !placeData) throw placeError ?? new Error("Place insert failed");

    // 4) Insert into reviews with ALL photo URLs
    const taggedFriendsStr = values.tagged_friends?.length
      ? values.tagged_friends.join(",")
      : null;

    const { data: reviewData, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        place_id: placeData.id,
        rating_food: values.rating_food,
        rating_service: values.rating_service,
        rating_atmosphere: values.rating_atmosphere,
        rating_value: values.rating_value,
        text: values.description,
        photo_urls: finalPhotoUrls,       // ← store entire array
        tagged_friends: taggedFriendsStr
      })
      .select()
      .single();
    if (reviewError) throw reviewError;

    // 5) Wishlist
    await supabase.from("wishlists").insert({
      user_id: user.id,
      place_id: placeData.id,
      note: `${values.price_range} · ${values.description || "No description"}`
    });

    // 6) Share with friends
    if (values.tagged_friends?.length) {
      const notifications = values.tagged_friends.map(friendId => ({
        user_id: friendId,
        sender_id: user.id,
        place_id: placeData.id,
        type: "place_share"
      }));
      await supabase.from("notifications").insert(notifications);
    }

    toast.success("Place added and shared successfully!");
    // decide where to navigate…
    if (showFriendSelector) {
      navigate("/profile");
    } else {
      setShowFriendSelector(true);
    }

  } catch (err: any) {
    console.error("Error adding place:", err);
    toast.error(err.message || "Failed to add place");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex-grow w-full px-4 py-8 md:py-12 max-w-[1440px] mx-auto">
      <div className="mx-auto max-w-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            {/* Place information (name, address, etc) */}
            <PlaceInformationSection 
              form={form} 
              handlePlaceSelect={handlePlaceSelect}
              isSubmitting={isSubmitting}
            />
            
            {/* Details (cuisine, vibes, occasions, price) */}
            <PlaceDetailsSection 
              form={form} 
              cuisineOptions={cuisineOptions}
              vibeOptions={vibeOptions}
              occasionOptions={occasionOptions} 
            />
            
            {/* Your experience - moved up before ratings */}
            <PlaceExperienceSection form={form} isSubmitting={isSubmitting} />
            
            {/* Ratings */}
            <PlaceRatingsSection form={form} />
            
            {/* Who joined you - new section */}
            <FriendTagsSection form={form} />
            
            {/* Photos */}
            <PlacePhotosSection form={form} googleMapPhoto={googleMapPhoto} />
            
            {/* Visibility toggle */}
            <PlaceVisibilityToggle form={form} isSubmitting={isSubmitting} />
            
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
  );
}
