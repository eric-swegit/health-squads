import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Info, 
  Dumbbell, 
  Book, 
  Leaf, // Replace 'Vegetarian'
  Home, 
  Activity as ActivityIcon // Rename Activity icon to ActivityIcon
} from "lucide-react";
import { Activity } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ActivityList = () => {
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');
  const [commonActivities, setCommonActivities] = useState<Activity[]>([]);
  const [personalActivities, setPersonalActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const activityInfo: Record<string, string> = {
    "Mindfulness 20 min": "Mindfulness kan exempelvis vara att läsa bok, lösa soduko, meditera eller annat liknande, denna aktivitet ska vara helt SKÄRMFRI.",
    "Vegetarisk dag": "Ät inga kött- eller fiskprodukter under hela dagen.",
    "Frukt/grönt till 3 måltider": "Se till att inkludera frukt eller grönsaker i minst tre måltider under dagen.",
    "Inget koffein hela dagen": "Undvik kaffe, te, energidrycker och andra koffeinhaltiga drycker.",
    "Hemmaträning 20 min": "Genomför ett träningspass hemma som varar i minst 20 minuter.",
    "Gym 30 min": "Besök gymmet och träna i minst 30 minuter.",
    "Dricka 1.5L vatten": "Drick minst 1,5 liter vatten under dagen.",
    "20K steg": "Ta minst 20 000 steg under dagen.",
    "10K steg": "Ta minst 10 000 steg under dagen.",
    "5K steg": "Ta minst 5 000 steg under dagen."
  };

  const getActivityIcon = (activityName: string) => {
    if (activityName.includes("Gym")) return Dumbbell;
    if (activityName.includes("steg")) return ActivityIcon; // Changed from Steps to ActivityIcon
    if (activityName.includes("Mindfulness") || activityName.includes("bok")) return Book;
    if (activityName.includes("Vegetarisk")) return Leaf; // Changed from Vegetarian to Leaf
    if (activityName.includes("Frukt")) return Leaf; // Changed from Fruit to Leaf
    if (activityName.includes("Hemmaträning")) return Home;
    if (activityName.includes("vatten")) return ActivityIcon; // Changed from Water to ActivityIcon
    if (activityName.includes("koffein")) return ActivityIcon;
    return ActivityIcon; // Default icon
  };

  useEffect(() => {
    // Get the current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        return session.user;
      }
      return null;
    };

    // Fetch activities
    const fetchActivities = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch common activities
        const { data: commonData, error: commonError } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'common');

        if (commonError) throw commonError;
        
        // Fetch personal activities for the user
        const { data: personalData, error: personalError } = await supabase
          .from('activities')
          .select('*')
          .eq('type', 'personal')
          .eq('user_id', currentUser.id);

        if (personalError) throw personalError;

        // Fetch claimed activities for today
        const today = new Date().toISOString().split('T')[0];
        const { data: claimedData, error: claimedError } = await supabase
          .from('claimed_activities')
          .select('activity_id')
          .eq('user_id', currentUser.id)
          .eq('date', today);

        if (claimedError) throw claimedError;

        // Map to our Activity type
        setCommonActivities(commonData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type
        })));

        setPersonalActivities(personalData.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          points: activity.points,
          requiresPhoto: activity.requires_photo,
          type: activity.type,
          userId: activity.user_id
        })));

        setClaimedToday(claimedData.map((item: any) => item.activity_id));
      } catch (error: any) {
        toast.error(`Error fetching activities: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleClaim = async (activity: Activity) => {
    if (!user) {
      toast.error("Du måste vara inloggad för att claima aktiviteter");
      return;
    }

    if (claimedToday.includes(activity.id)) {
      toast.error("Du har redan claimat denna aktivitet idag");
      return;
    }

    if (activity.requiresPhoto) {
      // Open file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${activity.id}_${Date.now()}.${fileExt}`;
            
            const { data, error } = await supabase.storage
              .from('activity-photos')
              .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
              .from('activity-photos')
              .getPublicUrl(fileName);

            // Save claimed activity with photo URL
            await saveClaimedActivity(activity, urlData.publicUrl);
          } catch (error: any) {
            toast.error(`Uppladdning misslyckades: ${error.message}`);
          }
        }
      };
      input.click();
    } else {
      // Claim without photo
      try {
        await saveClaimedActivity(activity);
      } catch (error: any) {
        toast.error(`Kunde inte claima aktivitet: ${error.message}`);
      }
    }
  };

  const saveClaimedActivity = async (activity: Activity, photoUrl?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('claimed_activities')
      .insert({
        user_id: user.id,
        activity_id: activity.id,
        date: today,
        photo_url: photoUrl || null
      });

    if (error) throw error;

    // Update local state
    setClaimedToday([...claimedToday, activity.id]);
    toast.success(`Claimade ${activity.name} för ${activity.points} poäng!`);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

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

        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(activeSection === 'common' ? commonActivities : personalActivities).map((activity) => {
              const ActivityIcon = getActivityIcon(activity.name);
              const isClaimed = claimedToday.includes(activity.id);
              
              return (
                <Card 
                  key={activity.id} 
                  className={`overflow-hidden transition-all ${isClaimed ? 'bg-gray-100 border-green-300' : 'hover:shadow-md'}`}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-3">
                        <ActivityIcon className="h-5 w-5 mr-2 text-purple-600" />
                        <h3 className="font-medium text-sm">{activity.name}</h3>
                      </div>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full bg-purple-50"
                              onClick={() => {
                                setSelectedActivity(activity);
                                setInfoOpen(true);
                              }}
                            >
                              <Info className="h-3 w-3 text-purple-700" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Visa info</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-purple-700">{activity.points}p</span>
                      <Button 
                        onClick={() => handleClaim(activity)} 
                        variant={isClaimed ? "outline" : "default"}
                        size="sm"
                        className={isClaimed ? "border-green-500 text-green-700" : ""}
                        disabled={isClaimed}
                      >
                        {activity.requiresPhoto && <Camera className="mr-1 h-3 w-3" />}
                        {isClaimed ? "Claimad" : "Claima"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {activeSection === 'personal' && personalActivities.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              Du har inga personliga aktiviteter än. Kontakta en administratör för att lägga till personliga mål.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedActivity?.name}</DialogTitle>
            <DialogDescription>
              {selectedActivity && activityInfo[selectedActivity.name] ? 
                activityInfo[selectedActivity.name] : 
                "Ingen beskrivning tillgänglig för denna aktivitet."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              Poäng: <span className="font-bold text-purple-700">{selectedActivity?.points}p</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedActivity?.requiresPhoto ? "Kräver foto" : "Inget foto krävs"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityList;
