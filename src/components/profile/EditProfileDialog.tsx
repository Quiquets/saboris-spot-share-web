import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { User } from "@/types/global";
import { ProfileImageUpload } from "./profile-components/ProfileImageUpload";
import { ProfileFormFields } from "./profile-components/ProfileFormFields";
import { PrivacyToggle } from "./profile-components/PrivacyToggle";
import { DeleteAccountButton } from "./profile-components/DeleteAccountButton";

export interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  name: string;
  setName: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  userLocation: string;
  setUserLocation: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  profileImageUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: () => Promise<boolean>;
  handleDeleteAccount: () => void;
  isSubmitting: boolean;
}

const EditProfileDialog = ({
  isOpen,
  onOpenChange,
  user,
  name,
  setName,
  username,
  setUsername,
  userLocation,
  setUserLocation,
  bio,
  setBio,
  isPrivate,
  setIsPrivate,
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
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Avatar upload */}
          <ProfileImageUpload
            profileImageUrl={profileImageUrl}
            handleFileChange={handleFileChange}
            username={username}
            user={user}
          />

          {/* Name, Username, Location, Bio */}
          <ProfileFormFields
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            bio={bio}
            setBio={setBio}
          />

          {/* Privacy toggle */}
          <PrivacyToggle isPrivate={isPrivate} setIsPrivate={setIsPrivate} />

          <div className="flex items-center justify-between border-t pt-4">
            {/* Delete Account */}
            <DeleteAccountButton onDelete={handleDeleteAccount} />

            {/* Cancel / Save */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="bg-saboris-primary hover:bg-saboris-primary/90 text-white flex items-center gap-1"
                onClick={async () => {
                  const ok = await handleSaveProfile();
                  if (ok) onOpenChange(false);
                }}
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
