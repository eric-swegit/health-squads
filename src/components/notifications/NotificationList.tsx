
import { Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  setOpen: (open: boolean) => void;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationList = ({ notifications, loading, setOpen, markAsRead }: NotificationListProps) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Laddar notifikationer...</div>;
  }

  if (notifications.length === 0) {
    return <div className="p-4 text-center text-sm text-gray-500">Inga notifikationer</div>;
  }

  const handleClick = (notification: Notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Close popover
    setOpen(false);
    
    // Navigate to relevant page if needed based on notification type
    if (notification.activity_id) {
      // For now just navigate to main feed
      navigate('/');
    } else if (notification.type.includes('leaderboard')) {
      navigate('/leaderboard');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'leaderboard_daily':
      case 'leaderboard_total':
        return '🏆';
      default:
        return '📢';
    }
  };

  return (
    <div>
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.is_read ? 'bg-purple-50' : ''}`}
          onClick={() => handleClick(notification)}
        >
          <div className="flex items-start gap-2">
            <div className="text-lg">{getIcon(notification.type)}</div>
            <div className="flex-1">
              <p className="text-sm">{notification.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { 
                  addSuffix: true,
                  locale: sv
                })}
              </p>
            </div>
            {!notification.is_read && (
              <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
