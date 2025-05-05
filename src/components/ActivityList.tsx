
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Activity } from '@/types';

const ActivityList = () => {
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');

  const commonActivities: Activity[] = [
    { id: '1', name: 'Gym 30 min', points: 5, requiresPhoto: true, type: 'common' },
    { id: '2', name: '20K steg', points: 8, requiresPhoto: true, type: 'common' },
    { id: '3', name: 'Dricka 1.5L vatten', points: 2, requiresPhoto: false, type: 'common' },
    { id: '4', name: 'Mindfulness 20 min', points: 1, requiresPhoto: false, type: 'common' },
  ];

  const personalActivities: Activity[] = [
    { id: 'p1', name: 'Vakna innan 05:30', points: 1, requiresPhoto: true, type: 'personal', userId: '1' },
    { id: 'p2', name: '11 st push-ups', points: 1, requiresPhoto: true, type: 'personal', userId: '1' },
  ];

  const handleClaim = async (activity: Activity) => {
    if (activity.requiresPhoto) {
      // Open file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // TODO: Handle file upload and activity claim
          console.log('Uploading file for activity:', activity.name);
        }
      };
      input.click();
    } else {
      // TODO: Handle activity claim without photo
      console.log('Claiming activity:', activity.name);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-2 mb-4">
          <Button 
            variant={activeSection === 'common' ? "default" : "outline"}
            onClick={() => setActiveSection('common')}
            className="flex-1"
          >
            Gemensamma
          </Button>
          <Button 
            variant={activeSection === 'personal' ? "default" : "outline"}
            onClick={() => setActiveSection('personal')}
            className="flex-1"
          >
            Personliga
          </Button>
        </div>

        <div className="space-y-2">
          {(activeSection === 'common' ? commonActivities : personalActivities).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
              <div>
                <div className="font-medium">{activity.name}</div>
                <div className="text-sm text-gray-500">{activity.points}p</div>
              </div>
              <Button onClick={() => handleClaim(activity)} variant="outline">
                {activity.requiresPhoto && <Camera className="mr-2 h-4 w-4" />}
                Claima
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ActivityList;
