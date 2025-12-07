
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut, Gift } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ActivityHistory from '@/components/profile/ActivityHistory';
import GratitudeSection from '@/components/profile/GratitudeSection';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, stats, loading, uploadingImage, setUploadingImage } = useProfileData();

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
        
        <ProfileHeader 
          profile={profile} 
          uploadingImage={uploadingImage} 
          setUploadingImage={setUploadingImage} 
        />
        
        <ProfileStats stats={stats} />

        {/* Wrapped Button */}
        <Button
          onClick={() => navigate('/wrapped')}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
        >
          <Gift className="h-4 w-4 mr-2" />
          Se din HealthSquad Wrapped 2025
        </Button>
        
        <GratitudeSection />
        
        <ActivityHistory />
      </div>
    </div>
  );
};

export default ProfilePage;
