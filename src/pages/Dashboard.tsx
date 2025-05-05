
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import FeedList from '@/components/FeedList';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [daysLeft, setDaysLeft] = useState(0);
  const [timeUntilNextDay, setTimeUntilNextDay] = useState('');

  // Calculate days left in challenge
  useEffect(() => {
    const calculateDaysLeft = () => {
      const challengeEndDate = new Date('2025-05-31T23:59:59');
      const today = new Date();
      const diffTime = challengeEndDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour
    
    return () => clearInterval(interval);
  }, []);

  // Calculate time until next day
  useEffect(() => {
    const updateTimeUntilNextDay = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNextDay(`${hours}h ${minutes}m`);
    };

    updateTimeUntilNextDay();
    const interval = setInterval(updateTimeUntilNextDay, 60000); // Update every minute
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Hej, {userName || 'vän'}!</h1>
        </div>
        
        {/* Challenge status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="p-4 flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Dagar kvar i utmaningen</p>
              <p className="font-bold text-lg">{daysLeft} dagar</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Ny dag börjar om</p>
              <p className="font-bold text-lg">{timeUntilNextDay}</p>
            </div>
          </Card>
        </div>
        
        {/* Feed */}
        <FeedList />
      </div>
    </div>
  );
};

export default Dashboard;
