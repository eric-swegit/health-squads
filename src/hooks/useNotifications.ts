
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        setNotifications(data || []);
        
        // Calculate unread count
        const unread = (data || []).filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notification_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast.error(`Kunde inte markera notifikation som läst: ${error.message}`);
    }
  };

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
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
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
