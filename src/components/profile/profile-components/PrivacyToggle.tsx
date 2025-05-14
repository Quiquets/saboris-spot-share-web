
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PrivacyToggleProps {
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
}

export const PrivacyToggle = ({
  isPrivate,
  setIsPrivate
}: PrivacyToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="private-mode" 
        checked={isPrivate}
        onCheckedChange={setIsPrivate}
      />
      <Label htmlFor="private-mode" className="text-saboris-gray">
        Private Account
      </Label>
      <span className="text-xs bg-gray-100 text-saboris-gray px-2 py-0.5 rounded-full">
        {isPrivate ? "Only visible to followers" : "Visible to everyone"}
      </span>
    </div>
  );
};
