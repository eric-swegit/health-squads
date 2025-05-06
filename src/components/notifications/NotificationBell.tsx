
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative p-0 h-auto w-auto"
          aria-label="Notifikationer"
        >
          <Bell className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-96 overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifikationer</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={() => markAllAsRead()}
            >
              Markera alla som lästa
            </Button>
          )}
        </div>
        <NotificationList 
          notifications={notifications} 
          loading={loading} 
          setOpen={setOpen} 
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
