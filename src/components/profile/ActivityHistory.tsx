
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileActivityHistory } from "@/hooks/useProfileActivityHistory";
import ActivityHistoryItem from "./ActivityHistoryItem";
import { toast } from "@/components/ui/sonner";

const ActivityHistory = () => {
  const { user } = useAuth();
  const { activities, loading, error } = useProfileActivityHistory(user?.id || null, 10);

  const handleShowAll = () => {
    toast.info("Fullständig aktivitetshistorik kommer snart!");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Senaste aktiviteter</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <CalendarDays className="h-4 w-4 mr-2" />
            Visa alla
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Senaste aktiviteter</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <CalendarDays className="h-4 w-4 mr-2" />
            Visa alla
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500 py-4">
            Det gick inte att ladda aktivitetshistoriken.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Senaste aktiviteter</CardTitle>
        <Button variant="outline" size="sm" onClick={handleShowAll}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Visa alla
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Du har inte genomfört några aktiviteter än. Börja med att claima din första aktivitet!
          </p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityHistoryItem 
                key={activity.id} 
                activity={activity} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
