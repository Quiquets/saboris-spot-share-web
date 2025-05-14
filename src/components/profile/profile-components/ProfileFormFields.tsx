
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  userLocation: string;
  setUserLocation: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
}

export const ProfileFormFields = ({
  username,
  setUsername,
  userLocation,
  setUserLocation,
  bio,
  setBio
}: ProfileFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="username" className="text-saboris-gray">Username</Label>
        <Input 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="location" className="text-saboris-gray">Location</Label>
        <Input 
          id="location" 
          value={userLocation} 
          onChange={(e) => setUserLocation(e.target.value)}
          className="mt-1"
          placeholder="City, Country"
        />
      </div>
      
      <div>
        <Label htmlFor="bio" className="text-saboris-gray">Bio</Label>
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
