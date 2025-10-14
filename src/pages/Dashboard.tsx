
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, Medal } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import FeedList from '@/components/FeedList';
import { useLeaderboardData } from '@/components/LeaderboardSummary';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [hoursLeft, setHoursLeft] = useState(0);
  const [minutesLeft, setMinutesLeft] = useState(0);
  const { users } = useLeaderboardData();

  // Get current user's position and point information
  const getUserPositionInfo = () => {
    if (!users.length) return { position: 0, myPoints: 0, pointsText: "Laddar..." };
    
    // Sort users by total points
    const sortedUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Find current user's position
    const currentUser = sortedUsers.find(user => user.name === userName);
    if (!currentUser) return { position: 0, myPoints: 0, pointsText: "Laddar..." };
    
    const myPoints = currentUser.totalPoints;
    const myPosition = sortedUsers.findIndex(user => user.name === userName) + 1;
    
    // If user is first place
    if (myPosition === 1) {
      const secondPlaceUser = sortedUsers[1];
      const pointsAhead = secondPlaceUser ? myPoints - secondPlaceUser.totalPoints : 0;
      
      return {
        position: myPosition,
        myPoints,
        pointsText: `Du ligger först med ${pointsAhead} poäng före tvåan`
      };
    } 
    // User is not first
    else {
      const userAhead = sortedUsers[myPosition - 2]; // -2 because array is 0-indexed and we want the position ahead
      const pointsNeeded = userAhead ? userAhead.totalPoints - myPoints : 0;
      
      return {
        position: myPosition,
        myPoints,
        pointsText: `Du ligger ${getPositionText(myPosition)} med ${pointsNeeded} poäng efter ${getPositionText(myPosition - 1)}`
      };
    }
  };
  
  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return "etta";
      case 2: return "tvåa";
      case 3: return "trea";
      default: return position + ":a";
    }
  };

  // Calculate days left in challenge
  useEffect(() => {
    const calculateTimeLeft = () => {
      const challengeEndDate = new Date('2025-10-15T23:59:59');
      const now = new Date();
      const diffTime = challengeEndDate.getTime() - now.getTime();
      
      if (diffTime > 0) {
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
        
        setDaysLeft(days);
        setHoursLeft(hours);
        setMinutesLeft(minutes);
      } else {
        setDaysLeft(0);
        setHoursLeft(0);
        setMinutesLeft(0);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('name, total_points')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          if (data) {
            setUserName(data.name);
            setUserPoints(data.total_points);
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    getProfile();
    
    // Initialize last viewed feed time if not set
    if (!localStorage.getItem('lastViewedFeed')) {
      localStorage.setItem('lastViewedFeed', new Date().toISOString());
    }
    
    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profile_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          getProfile();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const positionInfo = getUserPositionInfo();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4 px-4 pt-4">
          <h1 className="text-xl font-bold">Hej, {userName || 'vän'}!</h1>
        </div>
        
        {/* Challenge status */}
        <Card className="mx-4 mb-8 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm font-medium opacity-90">Tävlingen avslutas om</span>
              </div>
              <div className="text-2xl font-bold tracking-wide">
                {daysLeft}D {hoursLeft}T {minutesLeft}M
              </div>
            </div>
            
            <div className="border-t border-primary-foreground/20 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="h-6 w-6" />
                  <span className="text-sm font-medium opacity-90">Dina poäng</span>
                </div>
                <div className="text-2xl font-bold">{userPoints}</div>
              </div>
              <p className="text-sm mt-2 opacity-90">{positionInfo.pointsText}</p>
            </div>
          </div>
        </Card>
        
        {/* Feed */}
        <FeedList />
      </div>
    </div>
  );
};

export default Dashboard;
