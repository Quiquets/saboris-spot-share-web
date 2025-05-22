// src/components/places/ImageUpload.tsx
import { useState } from "react";
import { Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  itemId?: string;             // e.g. the place_id from your form
  bucketName?: "post-pictures"; // only post-pictures here
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 3,
  itemId,
  bucketName = "post-pictures"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

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
      const fileExt = file.name.split(".").pop();
      const baseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9._-]/g, "");
      const fileName = `${Date.now()}_${baseName}.${fileExt}`;
      
      // Build path under users/{user.id}/places/{itemId}/filename
      let filePath = fileName;
      if (user?.id && itemId) {
        filePath = `users/${user.id}/places/${itemId}/${fileName}`;
      } else if (user?.id) {
        filePath = `users/${user.id}/${fileName}`;
      }

      // 1) Upload to the correct bucket
      const { error: uploadError } = await supabase.storage
        .from(bucketName)               // ← must be 'post-pictures'
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;

      // 2) Get public URL
      const { data: urlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      if (!urlData.publicUrl) {
        console.error("getPublicUrl error", filePath);
        toast.error("Failed to get image URL");
        return;
      }

      // 3) Append to your images array
      const newImageUrl = `${urlData.publicUrl}?v=${Date.now()}`;
      onChange([...images, newImageUrl]);              // ← FIXED typo here :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
      toast.success("Image uploaded!");
    } catch (err: any) {
      console.error(`Error uploading to ${bucketName}:`, err);
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block font-medium">Photos</label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative h-24 w-24">
            <img
              src={url}
              alt={`Uploaded ${idx + 1}`}
              className="h-full w-full object-cover rounded-md"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 p-0"
              onClick={() => {
                const next = [...images];
                next.splice(idx, 1);
                onChange(next);
                toast.info("Image removed");
              }}
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
            onClick={() =>
              document.getElementById(`upload-${itemId}`)?.click()
            }
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Image className="h-6 w-6" />
            )}
            <input
              id={`upload-${itemId}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) uploadImage(e.target.files[0]);
                e.target.value = "";
              }}
              disabled={isUploading}
            />
          </Button>
        )}
      </div>
      <p className="text-sm text-gray-500">
        You can upload up to {maxImages} photos (max 5MB each) to “{bucketName}.”
      </p>
    </div>
  );
}
