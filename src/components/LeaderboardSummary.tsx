
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from "@/components/ui/sonner";

// Create a custom hook for leaderboard data that can be refreshed
export const useLeaderboardData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_profiles_filtered');
      
      if (error) throw error;
      
      if (data) {
        const mappedUsers = data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          totalPoints: user.total_points,
          dailyPoints: user.daily_points,
        }));
        setUsers(mappedUsers);
        setLastFetch(Date.now());
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error.message);
      toast.error(`Kunde inte ladda leaderboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUsers();

    // Set up polling every 60 seconds (instead of aggressive real-time)
    const interval = setInterval(() => {
      fetchUsers();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const refreshLeaderboard = () => {
    // Prevent refresh spam - minimum 5 seconds between refreshes
    const now = Date.now();
    if (now - lastFetch < 5000) {
      return;
    }
    fetchUsers();
  };

  return { users, loading, refreshLeaderboard };
};

const LeaderboardSummary = () => {
  const { users, loading } = useLeaderboardData();

  if (loading) {
    return <div className="p-4 text-center mb-4">Laddar leaderboard...</div>;
  }

  const topDailyUsers = [...users].sort((a, b) => b.dailyPoints - a.dailyPoints).slice(0, 5);
  const topTotalUsers = [...users].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Leaderboard */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-gray-500">Dagens Poäng</h3>
            <div className="space-y-2">
              {topDailyUsers.map((user, index) => (
                <div key={`daily-${user.id}`} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-6 text-center text-sm">{index + 1}</div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                  <div className="font-bold text-sm">{user.dailyPoints}p</div>
                </div>
              ))}
              {topDailyUsers.length === 0 && (
                <div className="text-center p-2 text-gray-500 text-sm">Inga poäng registrerade idag.</div>
              )}
            </div>
          </div>

          {/* Total Leaderboard */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-gray-500">Totala Poäng</h3>
            <div className="space-y-2">
              {topTotalUsers.map((user, index) => (
                <div key={`total-${user.id}`} className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-6 text-center text-sm">
                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                      {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                      {index === 2 && <Trophy className="h-4 w-4 text-amber-600" />}
                      {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                    </div>
                    <span className="font-medium text-sm">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{user.totalPoints}p</div>
                  </div>
                </div>
              ))}
              {topTotalUsers.length === 0 && (
                <div className="text-center p-2 text-gray-500 text-sm">Inga användare med poäng ännu.</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSummary;
