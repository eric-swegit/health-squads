import FeedItemHeader from "./FeedItemHeader";
import FeedItemContent from "./FeedItemContent";
import FeedItemFooter from "./FeedItemFooter";
import FeedItemInlineComments from "./FeedItemInlineComments";
import { FeedItem as FeedItemType } from "./types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeedItemProps {
  item: FeedItemType;
  onLike: (item: FeedItemType) => void;
  onOpenComments: (item: FeedItemType) => void;
  onOpenImage: (imageUrl: string, allImages?: string[]) => void;
}

const FeedItem = ({ item, onLike, onOpenComments, onOpenImage }: FeedItemProps) => {
  const [currentUserImage, setCurrentUserImage] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUserImage = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('profile_image_url')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (profileData) {
          setCurrentUserImage(profileData.profile_image_url);
        }
      }
    };
    
    getCurrentUserImage();
  }, []);

  return (
    <article className="bg-background">
      <FeedItemHeader item={item} />
      <FeedItemContent 
        item={item} 
        onOpenImage={onOpenImage}
        onLike={onLike}
      />
      <FeedItemFooter 
        item={item} 
        onLike={onLike} 
        onOpenComments={onOpenComments}
      />
      <FeedItemInlineComments 
        comments={item.comments || []}
        totalCount={item.commentsCount || 0}
        onViewAll={() => onOpenComments(item)}
      />
      
      {/* Inline Comment Input */}
      <div 
        className="px-4 pb-3 flex items-center gap-3 cursor-text"
        onClick={() => onOpenComments(item)}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={currentUserImage || undefined} />
          <AvatarFallback>Du</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-sm text-gray-500">
          Lägg till en kommentar...
        </div>
      </div>
    </article>
  );
};

export default FeedItem;
