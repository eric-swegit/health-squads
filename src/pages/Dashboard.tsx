
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Camera, Check } from "lucide-react";
import Leaderboard from '@/components/Leaderboard';
import ActivityList from '@/components/ActivityList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'activities' | 'leaderboard'>('activities');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={activeTab === 'activities' ? "default" : "outline"}
            onClick={() => setActiveTab('activities')}
            className="flex-1"
          >
            <Check className="mr-2 h-4 w-4" />
            Aktiviteter
          </Button>
          <Button 
            variant={activeTab === 'leaderboard' ? "default" : "outline"}
            onClick={() => setActiveTab('leaderboard')}
            className="flex-1"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Button>
        </div>

        {activeTab === 'activities' ? (
          <ActivityList />
        ) : (
          <Leaderboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
