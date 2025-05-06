
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
    const calculateDaysLeft = () => {
      const challengeEndDate = new Date('2025-06-11T23:59:59'); // Updated to June 15th
      const today = new Date();
      const diffTime = challengeEndDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysLeft(diffDays > 0 ? diffDays : 0);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // Update every hour
    
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
              <p className="text-sm text-gray-500">Dagar kvar</p>
              <p className="font-bold text-lg">{daysLeft} dagar</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center">
            <Medal className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Mina poäng</p>
              <p className="font-bold text-lg">{userPoints} poäng</p>
              <p className="text-xs text-gray-500">{positionInfo.pointsText}</p>
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
