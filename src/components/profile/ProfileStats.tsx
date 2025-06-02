
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserStats } from "@/types/profile";

interface ProfileStatsProps {
  stats: UserStats;
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Statistik</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalActivities}</p>
            <p className="text-sm text-gray-500">Totala aktiviteter</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.activitiesThisWeek}</p>
            <p className="text-sm text-gray-500">Aktiviteter senaste 7 dagarna</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.streak}</p>
            <p className="text-sm text-gray-500">Dagars streak</p>
            <p className="text-xs text-gray-400 mt-1">Längsta streak: {stats.longestStreak}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
