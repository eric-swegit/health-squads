
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Info, 
  Dumbbell, 
  Book, 
  Leaf,
  Home,
  Activity as ActivityIcon,
  Coffee,
  GlassWater
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ActivityList = () => {
  const [activeSection, setActiveSection] = useState<'common' | 'personal'>('common');
  const [activeCategory, setActiveCategory] = useState<'all' | 'physical' | 'diet' | 'mind'>('all');
  const [commonActivities, setCommonActivities] = useState<Activity[]>([]);
  const [personalActivities, setPersonalActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimedToday, setClaimedToday] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const getActivityCategory = (activityName: string): 'physical' | 'diet' | 'mind' => {
    if (activityName.includes("Gym") || activityName.includes("steg") || activityName.includes("Hemmaträning")) {
      return 'physical';
    }
    if (activityName.includes("Vegetarisk") || activityName.includes("Frukt") || 
        activityName.includes("vatten") || activityName.includes("koffein")) {
      return 'diet';
    }
    return 'mind'; // Default to mind
  };

  const getActivityIcon = (activityName: string) => {
    if (activityName.includes("Gym")) return Dumbbell;
    if (activityName.includes("steg")) return ActivityIcon;
    if (activityName.includes("Mindfulness") || activityName.includes("bok")) return Book;
    if (activityName.includes("Vegetarisk")) return Leaf;
    if (activityName.includes("Frukt")) return Leaf;
    if (activityName.includes("Hemmaträning")) return Home;
    if (activityName.includes("vatten")) return GlassWater;
    if (activityName.includes("koffein")) return Coffee;
    return ActivityIcon; // Default icon
  };

  const getActivityDuration = (activityName: string): string => {
    if (activityName.includes("20 min")) return "20 min";
    if (activityName.includes("30 min")) return "30 min";
    if (activityName.includes("1.5L")) return "1.5 Liter";
    if (activityName.includes("20K")) return "20 000 steg";
    if (activityName.includes("10K")) return "10 000 steg";
    if (activityName.includes("5K")) return "5 000 steg";
    if (activityName.includes("3 måltider")) return "3 måltider";
    if (activityName.includes("dag")) return "Hela dagen";
    return "";
  };

  const getActivityTitle = (activityName: string): string => {
    if (activityName.includes("Mindfulness")) return "Mindfulness";
    if (activityName.includes("Vegetarisk")) return "Vegetarisk kost";
    if (activityName.includes("Frukt/grönt")) return "Frukt/grönt";
    if (activityName.includes("koffein")) return "Utan koffein";
    if (activityName.includes("Hemmaträning")) return "Hemmaträning";
    if (activityName.includes("Gym")) return "Gym";
    if (activityName.includes("Dricka")) return "Dricka vatten";
    if (activityName.includes("steg")) return "Gå/springa";
    return activityName;
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

    setSelectedActivity(activity);

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
      // Open confirmation dialog
      setConfirmOpen(true);
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
    setConfirmOpen(false);
    toast.success(`Bra jobbat! Du får ${activity.points} poäng för ${activity.name}!`);
  };

  if (loading) {
    return <div className="p-4 text-center">Laddar aktiviteter...</div>;
  }

  const getFilteredActivities = () => {
    const activities = activeSection === 'common' ? commonActivities : personalActivities;
    if (activeCategory === 'all') return activities;
    return activities.filter(activity => getActivityCategory(activity.name) === activeCategory);
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

        {/* Category filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button 
            variant={activeCategory === 'all' ? "default" : "outline"}
            onClick={() => setActiveCategory('all')}
            size="sm"
            className="whitespace-nowrap"
          >
            Alla aktiviteter
          </Button>
          <Button 
            variant={activeCategory === 'physical' ? "default" : "outline"}
            onClick={() => setActiveCategory('physical')}
            size="sm"
            className="whitespace-nowrap"
          >
            <Dumbbell className="h-4 w-4 mr-1" /> Fysiska aktiviteter
          </Button>
          <Button 
            variant={activeCategory === 'diet' ? "default" : "outline"}
            onClick={() => setActiveCategory('diet')}
            size="sm"
            className="whitespace-nowrap"
          >
            <Leaf className="h-4 w-4 mr-1" /> Kost och dryck
          </Button>
          <Button 
            variant={activeCategory === 'mind' ? "default" : "outline"}
            onClick={() => setActiveCategory('mind')}
            size="sm"
            className="whitespace-nowrap"
          >
            <Book className="h-4 w-4 mr-1" /> Sinnet
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {getFilteredActivities().map((activity) => {
              const ActivityIcon = getActivityIcon(activity.name);
              const isClaimed = claimedToday.includes(activity.id);
              const title = getActivityTitle(activity.name);
              const duration = getActivityDuration(activity.name);
              
              return (
                <Card 
                  key={activity.id} 
                  className={`overflow-hidden transition-all aspect-square ${
                    isClaimed ? 'bg-gray-100 border-green-300' : 'hover:shadow-md cursor-pointer'
                  }`}
                  onClick={() => !isClaimed && handleClaim(activity)}
                >
                  <CardContent className="p-4 flex flex-col justify-between h-full relative">
                    {/* Info button in top right */}
                    <div className="absolute top-0 right-0 p-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActivity(activity);
                            setInfoOpen(true);
                          }}>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full bg-purple-50"
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
                    
                    {/* Icon in center top */}
                    <div className="flex justify-center mb-2 mt-4">
                      <ActivityIcon className="h-10 w-10 text-purple-600" />
                    </div>
                    
                    {/* Activity name in center */}
                    <div className="text-center">
                      <h3 className="font-medium text-sm">{title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{duration}</p>
                    </div>
                    
                    {/* Status banner if claimed */}
                    {isClaimed && (
                      <div className="absolute inset-0 bg-green-100/70 flex items-center justify-center">
                        <div className="bg-white/80 py-1 px-3 rounded-full shadow-sm">
                          <span className="text-green-600 text-xs font-semibold">Genomförd idag</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Points in bottom right */}
                    <div className="absolute bottom-2 right-2">
                      <span className="text-sm font-bold text-purple-700">{activity.points}p</span>
                    </div>
                    
                    {/* Camera indicator */}
                    {activity.requiresPhoto && (
                      <div className="absolute bottom-2 left-2">
                        <Camera className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
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

          {getFilteredActivities().length === 0 && (
            <div className="text-center p-8 text-gray-500">
              Inga aktiviteter hittades i denna kategori.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Dialog */}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bekräfta genomförd aktivitet</AlertDialogTitle>
            <AlertDialogDescription>
              Har du genomfört "{selectedActivity?.name}"? Detta kommer att ge dig {selectedActivity?.points} poäng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedActivity && saveClaimedActivity(selectedActivity)}>
              Ja, jag har genomfört aktiviteten
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityList;
