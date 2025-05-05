
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Clock } from "lucide-react";
import ActivityList from '@/components/ActivityList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import LeaderboardSummary from '@/components/LeaderboardSummary';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [timeUntilNewDay, setTimeUntilNewDay] = useState('');

  // Calculate days left in challenge and time until new day
  useEffect(() => {
    // Set end date for the challenge (example: 30 days from now)
    const endDate = new Date('2025-06-05'); // Modify this to your actual end date
    const today = new Date();
    
    // Calculate days remaining
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays > 0 ? diffDays : 0);
    
    // Update time until midnight
    const updateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNewDay(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimeUntilMidnight();
    const interval = setInterval(updateTimeUntilMidnight, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          if (data) {
            setUserName(data.name);
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Du är nu utloggad");
    } catch (error: any) {
      toast.error(`Utloggning misslyckades: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Hej, {userName || 'vän'}!</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logga ut
          </Button>
        </div>
        
        {/* Challenge Info */}
        <div className="flex justify-between mb-4 gap-2">
          <Card className="flex-1 p-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Dagar kvar</p>
                <p className="font-bold text-lg">{daysLeft}</p>
              </div>
            </div>
          </Card>
          
          <Card className="flex-1 p-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Ny dag om</p>
                <p className="font-bold text-lg">{timeUntilNewDay}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Leaderboard Summary */}
        <LeaderboardSummary />
        
        {/* Activities */}
        <ActivityList />
      </div>
    </div>
  );
};

export default Dashboard;
