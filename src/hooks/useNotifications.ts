
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'leaderboard_daily' | 'leaderboard_total';
  content: string;
  activity_id: string | null;
  from_user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const notificationsChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get the current user session once
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      // Type assertion to ensure the expected notification types
      const typedNotifications = (data || []).map(item => ({
        ...item,
        type: item.type as 'like' | 'comment' | 'leaderboard_daily' | 'leaderboard_total'
      }));
      
      setNotifications(typedNotifications);
      
      // Calculate unread count
      const unread = typedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Setup subscription to notifications when userId is available
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();
    
    // Setup subscription only once per userId
    if (!notificationsChannel.current) {
      // Subscribe to notifications changes for this specific user only
      notificationsChannel.current = supabase
        .channel('notification_changes_' + userId)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
    }
      
    return () => {
      // Clean up subscription when component unmounts or userId changes
      if (notificationsChannel.current) {
        supabase.removeChannel(notificationsChannel.current);
        notificationsChannel.current = null;
      }
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state optimistically
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error(`Kunde inte markera notifikation som läst: ${error.message}`);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error(`Kunde inte markera alla notifikationer som lästa: ${error.message}`);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
