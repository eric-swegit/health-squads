
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  HeartIcon, 
  MessageSquare, 
  MoreVertical, 
  Heart,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface FeedItem {
  id: string;
  user_id: string;
  activity_id: string;
  activity_name: string;
  user_name: string;
  profile_image_url: string | null;
  photo_url: string | null;
  created_at: string;
  points: number;
  likes: number;
  userLiked: boolean;
  comments: Comment[];
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  profile_image_url: string | null;
}

const FeedList = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFeedItems = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch feed activities
        const { data: feedData, error: feedError } = await supabase
          .from('feed_activities')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (feedError) throw feedError;
        
        // Fetch likes for each activity
        const feedItemsWithLikes = await Promise.all(
          (feedData || []).map(async (item) => {
            // Get like count
            const { count: likesCount, error: countError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('claimed_activity_id', item.id);
              
            if (countError) throw countError;
            
            // Check if current user liked this activity
            const { data: userLikeData, error: userLikeError } = await supabase
              .from('likes')
              .select('id')
              .eq('claimed_activity_id', item.id)
              .eq('user_id', currentUser)
              .single();
              
            const userLiked = !userLikeError && userLikeData;

            // Get comments
            const { data: commentsData, error: commentsError } = await supabase
              .from('comments')
              .select(`
                id,
                user_id,
                content,
                created_at,
                profiles:user_id (
                  name,
                  profile_image_url
                )
              `)
              .eq('claimed_activity_id', item.id)
              .order('created_at', { ascending: true });
              
            if (commentsError) throw commentsError;
            
            // Format comments
            const formattedComments = (commentsData || []).map((comment) => ({
              id: comment.id,
              user_id: comment.user_id,
              content: comment.content,
              created_at: comment.created_at,
              user_name: comment.profiles?.name || 'Användare',
              profile_image_url: comment.profiles?.profile_image_url || null
            }));
            
            return {
              ...item,
              likes: likesCount || 0,
              userLiked: !!userLiked,
              comments: formattedComments
            };
          })
        );
        
        setFeedItems(feedItemsWithLikes);
      } catch (error: any) {
        console.error("Error fetching feed:", error);
        toast.error(`Kunde inte hämta feed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedItems();
    
    // Subscribe to realtime updates
    const feedChannel = supabase
      .channel('feed_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'claimed_activities' }, 
        () => {
          fetchFeedItems();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        () => {
          fetchFeedItems();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => {
          fetchFeedItems();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(feedChannel);
    };
  }, [currentUser]);

  const handleLike = async (item: FeedItem) => {
    if (!currentUser) return;
    
    try {
      if (item.userLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('claimed_activity_id', item.id)
          .eq('user_id', currentUser);
          
        if (error) throw error;
        
        // Update local state
        setFeedItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, likes: prevItem.likes - 1, userLiked: false } 
              : prevItem
          )
        );
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            claimed_activity_id: item.id,
            user_id: currentUser
          });
          
        if (error) throw error;
        
        // Update local state
        setFeedItems(prevItems => 
          prevItems.map(prevItem => 
            prevItem.id === item.id 
              ? { ...prevItem, likes: prevItem.likes + 1, userLiked: true } 
              : prevItem
          )
        );
      }
    } catch (error: any) {
      console.error("Error updating like:", error);
      toast.error(`Kunde inte uppdatera gillning: ${error.message}`);
    }
  };

  const openCommentDialog = (item: FeedItem) => {
    setSelectedItem(item);
    setCommentDialogOpen(true);
  };

  const handleAddComment = async () => {
    if (!currentUser || !selectedItem || !newComment.trim()) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          claimed_activity_id: selectedItem.id,
          user_id: currentUser,
          content: newComment.trim()
        });
        
      if (error) throw error;
      
      setNewComment("");
      // Fetch updated comments will happen via realtime subscription
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast.error(`Kunde inte lägga till kommentar: ${error.message}`);
    }
  };

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar feed...</div>;
  }

  return (
    <div className="space-y-4">
      {feedItems.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Inga aktiviteter i din feed än. När du och dina vänner gör aktiviteter kommer de att visas här!</p>
        </Card>
      )}
      
      {feedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={item.profile_image_url || undefined} />
                  <AvatarFallback>{item.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.user_name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: sv })}
                  </p>
                </div>
              </div>
              <MoreVertical className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <p className="mb-2">
              Genomförde <span className="font-medium">{item.activity_name}</span> och tjänade <span className="font-medium text-purple-600">{item.points}p</span>!
            </p>
            
            {item.photo_url && (
              <div 
                className="mt-3 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openImageDialog(item.photo_url!)}
              >
                <img 
                  src={item.photo_url} 
                  alt={item.activity_name}
                  className="w-full h-auto max-h-[300px] object-contain bg-black"
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex flex-col">
            <div className="flex justify-between items-center w-full py-2 border-t border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => handleLike(item)}
              >
                {item.userLiked ? (
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{item.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => openCommentDialog(item)}
              >
                <MessageSquare className="h-5 w-5" />
                <span>{item.comments.length}</span>
              </Button>
            </div>
            
            {item.comments.length > 0 && (
              <div className="pt-2 w-full">
                <div className="text-sm">
                  <span className="font-medium">{item.comments[0].user_name}</span>{" "}
                  <span>{item.comments[0].content}</span>
                </div>
                {item.comments.length > 1 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-gray-500"
                    onClick={() => openCommentDialog(item)}
                  >
                    Visa alla {item.comments.length} kommentarer
                  </Button>
                )}
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
      
      {/* Comments Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kommentarer</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-4 my-4">
            {selectedItem?.comments.length === 0 ? (
              <p className="text-center text-gray-500">Inga kommentarer än.</p>
            ) : (
              selectedItem?.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profile_image_url || undefined} />
                    <AvatarFallback>{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="font-medium text-sm">{comment.user_name}</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: sv })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Skriv en kommentar..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl p-1 bg-black">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedList;
