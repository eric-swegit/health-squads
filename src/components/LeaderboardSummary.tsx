
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from "@/components/ui/sonner";

const LeaderboardSummary = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_profiles');
        
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
        }
      } catch (error: any) {
        toast.error(`Failed to fetch users: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSummary;
