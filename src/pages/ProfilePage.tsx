
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Upload, 
  Trophy, 
  CalendarDays, 
  LogOut 
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  total_points: number;
  daily_points: number;
}

interface UserStats {
  totalActivities: number;
  activitiesThisWeek: number;
  streak: number;
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalActivities: 0,
    activitiesThisWeek: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfile(profileData);
        
        // Get activity stats
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('claimed_activities')
          .select('date')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false });
          
        if (activitiesError) throw activitiesError;
        
        if (activitiesData) {
          // Calculate total activities
          const totalActivities = activitiesData.length;
          
          // Calculate activities this week
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const activitiesThisWeek = activitiesData.filter(
            activity => new Date(activity.date) >= oneWeekAgo
          ).length;
          
          // Calculate streak
          let streak = 0;
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
          
          // Check if there's an activity today
          const hasActivityToday = activitiesData.some(activity => activity.date === today);
          
          // Check if there's an activity yesterday
          const hasActivityYesterday = activitiesData.some(activity => activity.date === yesterday);
          
          if (hasActivityToday) {
            streak = 1;
            
            // Check for consecutive days before today
            let checkDate = yesterday;
            let consecutiveDays = true;
            
            while (consecutiveDays) {
              const hasActivity = activitiesData.some(activity => activity.date === checkDate);
              if (hasActivity) {
                streak++;
                // Move to the previous day
                const nextDate = new Date(checkDate);
                nextDate.setDate(nextDate.getDate() - 1);
                checkDate = nextDate.toISOString().split('T')[0];
              } else {
                consecutiveDays = false;
              }
            }
          } else if (hasActivityYesterday) {
            streak = 1;
            
            // Check for consecutive days before yesterday
            let checkDate = new Date(yesterday);
            checkDate.setDate(checkDate.getDate() - 1);
            let dateStr = checkDate.toISOString().split('T')[0];
            let consecutiveDays = true;
            
            while (consecutiveDays) {
              const hasActivity = activitiesData.some(activity => activity.date === dateStr);
              if (hasActivity) {
                streak++;
                // Move to the previous day
                checkDate.setDate(checkDate.getDate() - 1);
                dateStr = checkDate.toISOString().split('T')[0];
              } else {
                consecutiveDays = false;
              }
            }
          }
          
          setStats({
            totalActivities,
            activitiesThisWeek,
            streak
          });
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast.error(`Kunde inte hämta profil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
    
    // Subscribe to profile changes
    const profileChannel = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => {
          getProfile();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'claimed_activities' },
        () => {
          getProfile();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    
    try {
      setUploadingImage(true);
      
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      
      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: urlData.publicUrl })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile({
        ...profile,
        profile_image_url: urlData.publicUrl
      });
      
      toast.success("Profilbild uppdaterad!");
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast.error(`Kunde inte ladda upp bild: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Du är nu utloggad");
    } catch (error: any) {
      toast.error(`Utloggning misslyckades: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 flex items-center justify-center">
      <p>Laddar profil...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Profil</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logga ut
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.profile_image_url || undefined} />
                  <AvatarFallback className="text-2xl">{profile?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <label htmlFor="profile-image-upload" className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-2 rounded-full cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <input 
                    id="profile-image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleProfileImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold mt-4">{profile?.name}</h2>
              <p className="text-gray-500">{profile?.email}</p>
              
              <div className="flex items-center mt-4">
                <div className="bg-purple-100 text-purple-700 font-bold px-4 py-2 rounded-lg flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  <span>{profile?.total_points} poäng</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
                <p className="text-sm text-gray-500">Aktiviteter denna vecka</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.streak}</p>
                <p className="text-sm text-gray-500">Dagars streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
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
      </div>
    </div>
  );
};

export default ProfilePage;
