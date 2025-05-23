// src/components/profile/profile-components/ProfileFormFields.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlaceAutocomplete } from "@/components/places/PlaceAutocomplete";
import type { PlaceDetails } from "@/types/place"; // Add this import

export interface ProfileFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  userLocation: string | PlaceDetails; // Accept PlaceDetails for consistency
  setUserLocation: (value: string | PlaceDetails) => void; // Accept PlaceDetails for consistency
  bio: string;
  setBio: (value: string) => void;
}

export const ProfileFormFields = ({
  name,
  setName,
  username,
  setUsername,
  userLocation,
  setUserLocation,
  bio,
  setBio,
}: ProfileFormFieldsProps) => {
  return (
    <>
      {/* Display Name */}
      <div>
        <Label htmlFor="name" className="text-saboris-gray">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          placeholder="Your display name"
        />
      </div>

      {/* Username */}
      <div>
        <Label htmlFor="username" className="text-saboris-gray">
          Username
        </Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1"
          placeholder="@your_username"
        />
      </div>

      {/* Location with PlaceAutocomplete */}
      <div>
        <Label htmlFor="location" className="text-saboris-gray">
          Location
        </Label>
        <PlaceAutocomplete
          value={typeof userLocation === "string" ? userLocation : userLocation?.name || ""}
          onPlaceSelect={(details) => {
            setUserLocation(details); // Pass full details for consistency
          }}
          types={['(cities)']}
          placeholder="Enter your city"
          disabled={false}
        />
        {/* Fallback or info text if needed */}
        {/* <p className="text-xs text-gray-500 mt-1">e.g., London, UK</p> */}
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio" className="text-saboris-gray">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 resize-none text-saboris-gray"
          placeholder="Tell others about yourself..."
          rows={3}
        />
      </div>
    </>
  );
};
