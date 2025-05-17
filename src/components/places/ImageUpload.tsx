import { useState, useContext } from "react";
import { Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/contexts/AuthContext";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  itemId?: string;
}

export function ImageUpload({ images, onChange, maxImages = 3, itemId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useContext(AuthContext);

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
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      let fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      let filePath = `${fileName}`;
      if (user?.id && itemId) {
        filePath = `${user.id}/${itemId}/${fileName}`;
      } else if (user?.id) {
        filePath = `${user.id}/${fileName}`;
      }
      
      const { error } = await supabase.storage
        .from('post-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      const { data: publicURLData } = supabase.storage
        .from('post-pictures')
        .getPublicUrl(filePath);

      const newImageUrl = `${publicURLData.publicUrl}?v=${Date.now()}`;
      onChange([...images, newImageUrl]);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image to post-pictures:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageUrlToRemove = images[index];
    console.log("Removing image locally:", imageUrlToRemove);
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
    toast.info("Image removed from current selection. Save changes to make it permanent.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadImage(e.target.files[0]);
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
            onClick={() => document.getElementById('photo-upload-post')?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Image className="h-6 w-6" />
            )}
            <input
              id="photo-upload-post"
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
        Upload up to {maxImages} photos (max 5MB each) to 'post-pictures' bucket.
      </p>
    </div>
  );
}
