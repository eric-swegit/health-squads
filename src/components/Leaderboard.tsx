
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leaderboard = () => {
  const rewards = {
    1: "1500 kr presentkort",
    2: "–",
    3: "Spring 3 km under 25 min",
    4: "Spring 6 km under 50 min"
  };

  const mockUsers = [
    { id: '1', name: 'Parmida', totalPoints: 25, dailyPoints: 8 },
    { id: '2', name: 'Nasim', totalPoints: 20, dailyPoints: 5 },
    { id: '3', name: 'Eric', totalPoints: 18, dailyPoints: 3 },
    { id: '4', name: 'Tobias', totalPoints: 15, dailyPoints: 4 },
  ];

  return (
    <Card className="p-4">
      <Tabs defaultValue="total">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="total">Total</TabsTrigger>
          <TabsTrigger value="daily">Idag</TabsTrigger>
        </TabsList>

        <TabsContent value="total">
          <div className="space-y-2">
            {mockUsers.sort((a, b) => b.totalPoints - a.totalPoints).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Trophy className="h-5 w-5 text-amber-600" />}
                    {index === 3 && <span className="text-gray-500">4</span>}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{user.totalPoints}p</div>
                  <div className="text-xs text-gray-500">{rewards[index + 1]}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="daily">
          <div className="space-y-2">
            {mockUsers.sort((a, b) => b.dailyPoints - a.dailyPoints).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 text-center">{index + 1}</div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="font-bold">{user.dailyPoints}p</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default Leaderboard;
