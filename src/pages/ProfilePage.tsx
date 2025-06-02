import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";
import { useProfileData } from '@/hooks/useProfileData';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ActivityHistory from '@/components/profile/ActivityHistory';
import EmailTester from '@/components/email/EmailTester';

const ProfilePage = () => {
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
        
        <EmailTester />
        
        <ActivityHistory />
      </div>
    </div>
  );
};

export default ProfilePage;
