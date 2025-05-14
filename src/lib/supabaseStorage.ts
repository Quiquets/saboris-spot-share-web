
import { supabase } from '@/integrations/supabase/client';

export const createBuckets = async () => {
  try {
    // Check if avatars bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const avatarsBucketExists = buckets?.some(b => b.name === 'avatars');
    if (!avatarsBucketExists) {
      await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152 // 2MB
      });
    }
    
    const placePhotosBucketExists = buckets?.some(b => b.name === 'place-photos');
    if (!placePhotosBucketExists) {
      await supabase.storage.createBucket('place-photos', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
    }
    
    console.log('Storage buckets verified/created');
    return true;
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    return false;
  }
};

export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Check if bucket exists first
    await createBuckets();
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload the file
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return null;
  }
};

export const deleteProfileImage = async (url: string): Promise<boolean> => {
  try {
    // Extract filename from URL
    const filename = url.split('/').pop();
    if (!filename) return false;
    
    // Delete the file
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filename]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting profile image:', error);
    return false;
  }
};

export const uploadPlacePhoto = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Check if bucket exists first
    await createBuckets();
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload the file
    const { error } = await supabase.storage
      .from('place-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data } = supabase.storage
      .from('place-photos')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading place photo:', error);
    return null;
  }
};
