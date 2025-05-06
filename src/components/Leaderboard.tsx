
import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from "@/components/ui/sonner";

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getRewardText = (position: number) => {
    switch (position) {
      case 1: return "1500 kr presentkort";
      case 2: return "Kämpa du är nästan där";
      case 3: return "3km lopp under 25 min";
      case 4: return "6km lopp under 50 min";
      default: return "";
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Use the RPC function that bypasses RLS
        const { data, error } = await supabase.rpc('get_profiles');
        
        if (error) throw error;
        
        if (data) {
          // Map to our User type
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
    return <div className="p-4 text-center">Laddar leaderboard...</div>;
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="total">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="total">Total</TabsTrigger>
          <TabsTrigger value="daily">Idag</TabsTrigger>
        </TabsList>

        <TabsContent value="total">
          <div className="space-y-2">
            {users.sort((a, b) => b.totalPoints - a.totalPoints).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Trophy className="h-5 w-5 text-amber-600" />}
                    {index > 2 && <span className="text-gray-500">{index + 1}</span>}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{user.totalPoints}p</div>
                  <div className="text-xs text-gray-500">{getRewardText(index + 1)}</div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center p-4 text-gray-500">
                Inga användare hittades.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily">
          <div className="space-y-2">
            {users.sort((a, b) => b.dailyPoints - a.dailyPoints).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 text-center">{index + 1}</div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="font-bold">{user.dailyPoints}p</div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center p-4 text-gray-500">
                Inga dagliga poäng ännu.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default Leaderboard;
