
import { Card } from "@/components/ui/card";
import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemFooter from "./FeedItemFooter";
import { FeedItem as FeedItemType } from "./types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeedItemProps {
  item: FeedItemType;
  onLike: (item: FeedItemType) => void;
  onOpenComments: (item: FeedItemType) => void;
  onOpenImage: (imageUrl: string) => void;
  onAddComment: (itemId: string, comment: string) => void;
}

const FeedItem = ({ item, onLike, onOpenComments, onOpenImage, onAddComment }: FeedItemProps) => {
  const [currentUserProfile, setCurrentUserProfile] = useState<{ image: string | null; name: string } | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, profile_image_url')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          setCurrentUserProfile({
            image: profileData.profile_image_url,
            name: profileData.name
          });
        }
      }
    };
    
    getCurrentUser();
  }, []);

  return (
    <Card className="overflow-hidden">
      <FeedItemHeader item={item} />
      <FeedItemContent item={item} onOpenImage={onOpenImage} />
      <FeedItemFooter 
        item={item} 
        onLike={onLike} 
        onOpenComments={onOpenComments}
      />
    </Card>
  );
};

export default FeedItem;
