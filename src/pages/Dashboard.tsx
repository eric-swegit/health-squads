
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import ActivityList from '@/components/ActivityList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import LeaderboardSummary from '@/components/LeaderboardSummary';

const Dashboard = () => {
  const [userName, setUserName] = useState('');

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
        
        {/* Leaderboard Summary */}
        <LeaderboardSummary />
        
        {/* Activities */}
        <ActivityList />
      </div>
    </div>
  );
};

export default Dashboard;
