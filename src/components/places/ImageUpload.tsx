
import { useState } from "react";
import { Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 3 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File) => {
    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Check if bucket exists, create it if it doesn't
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'place-photos');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('place-photos', { public: true });
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('place-photos')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: publicURLData } = supabase.storage
        .from('place-photos')
        .getPublicUrl(filePath);

      onChange([...images, publicURLData.publicUrl]);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block font-medium">Photos</label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative h-24 w-24">
            <img
              src={url}
              alt={`Uploaded image ${index + 1}`}
              className="h-full w-full object-cover rounded-md"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            className="h-24 w-24 border-dashed"
            disabled={isUploading}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Image className="h-6 w-6" />
            )}
            <input
              id="photo-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Upload up to {maxImages} photos of this place (max 5MB each)
      </p>
    </div>
  );
}
