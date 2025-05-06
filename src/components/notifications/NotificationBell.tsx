
import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, loading, markAllAsRead, markAsRead } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="relative p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          aria-label="Notifikationer"
        >
          <BellRing className="h-7 w-7 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-2 w-2 rounded-full bg-red-500">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 max-h-96 overflow-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifikationer</h3>
          {unreadCount > 0 && (
            <button 
              className="text-xs py-1 px-2 rounded hover:bg-gray-100"
              onClick={() => markAllAsRead()}
            >
              Markera alla som lästa
            </button>
          )}
        </div>
        <NotificationList 
          notifications={notifications} 
          loading={loading} 
          setOpen={setOpen} 
          markAsRead={markAsRead}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
