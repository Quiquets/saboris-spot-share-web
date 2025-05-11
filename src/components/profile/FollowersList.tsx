
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FollowersListProps {
  followers: any[];
  setShowFollowers: (show: boolean) => void;
}

const FollowersList = ({ followers, setShowFollowers }: FollowersListProps) => {
  if (followers.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Followers</h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowFollowers(false)}
        >
          Close
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((follower) => (
          <Card key={follower.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={follower.avatar_url || undefined} />
                  <AvatarFallback className="bg-saboris-primary/10">
                    {follower.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">{follower.name}</p>
                  <p className="text-sm text-gray-500">@{follower.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
