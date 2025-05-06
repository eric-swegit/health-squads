
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";

const ActivityHistory = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Senaste aktiviteter</CardTitle>
        <Button variant="outline" size="sm">
          <CalendarDays className="h-4 w-4 mr-2" />
          Visa alla
        </Button>
      </CardHeader>
      <CardContent>
        {/* We'll implement history later */}
        <p className="text-center text-gray-500 py-4">Din aktivitetshistorik kommer att visas här.</p>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
