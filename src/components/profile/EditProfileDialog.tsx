
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/types/global";
import { ProfileImageUpload } from "./profile-components/ProfileImageUpload";
import { ProfileFormFields } from "./profile-components/ProfileFormFields";
import { PrivacyToggle } from "./profile-components/PrivacyToggle";
import { DeleteAccountButton } from "./profile-components/DeleteAccountButton";
import { Loader2, Save } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  bio: string;
  setBio: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  userLocation: string;
  setUserLocation: (value: string) => void;
  profileImageUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => void;
  handleDeleteAccount: () => void;
  isSubmitting: boolean;
}

const EditProfileDialog = ({
  isOpen,
  onOpenChange,
  user,
  isPrivate,
  setIsPrivate,
  bio,
  setBio,
  username,
  setUsername,
  userLocation,
  setUserLocation,
  profileImageUrl,
  handleFileChange,
  handleSaveProfile,
  handleDeleteAccount,
  isSubmitting,
}: EditProfileDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-saboris-gray">Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <ProfileImageUpload 
            profileImageUrl={profileImageUrl}
            handleFileChange={handleFileChange}
            username={username}
            user={user}
          />
          
          <ProfileFormFields
            username={username}
            setUsername={setUsername}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            bio={bio}
            setBio={setBio}
          />
          
          <PrivacyToggle
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
          />
          
          <div className="flex items-center justify-between border-t pt-4">
            <DeleteAccountButton onDelete={handleDeleteAccount} />
            
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                className="bg-saboris-primary hover:bg-saboris-primary/90 text-white flex items-center gap-1"
                onClick={handleSaveProfile}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
