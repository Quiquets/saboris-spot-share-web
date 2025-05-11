
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/types/global";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, Trash2 } from "lucide-react";
import React from "react";

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
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-saboris-primary">
                <AvatarImage 
                  src={profileImageUrl || undefined} 
                  className="object-cover h-full w-full"
                />
                <AvatarFallback className="bg-saboris-primary/20 text-saboris-primary">
                  {user.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              
              <label 
                htmlFor="profile-photo" 
                className="absolute bottom-0 right-0 bg-saboris-primary hover:bg-saboris-primary/90 p-1.5 rounded-full cursor-pointer text-white"
              >
                <Camera className="h-4 w-4" />
                <input 
                  id="profile-photo" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={userLocation} 
              onChange={(e) => setUserLocation(e.target.value)}
              className="mt-1"
              placeholder="City, Country"
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 resize-none"
              placeholder="Tell others about yourself..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="private-mode" 
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private-mode">
              Private Account
            </Label>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {isPrivate ? "Only visible to followers" : "Visible to everyone"}
            </span>
          </div>
          
          <div className="flex items-center justify-between border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
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
