
import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback 
} from "@/components/ui/avatar";
import { 
  Button 
} from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from "@/types/profile";
import { useState } from "react";
import ImageCropper from "./ImageCropper";

interface ProfileHeaderProps {
  profile: UserProfile | null;
  uploadingImage: boolean;
  setUploadingImage: (state: boolean) => void;
}

const ProfileHeader = ({ profile, uploadingImage, setUploadingImage }: ProfileHeaderProps) => {
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    
    setSelectedFile(file);
    // Create a temporary URL for the selected image to preview in the cropper
    const imageUrl = URL.createObjectURL(file);
    setCropImageUrl(imageUrl);
  };
  
  const handleCropCancel = () => {
    setCropImageUrl(null);
    setSelectedFile(null);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!profile) return;
    
    try {
      setUploadingImage(true);
      
      // Create a file from the cropped blob
      const fileName = `${profile.id}_${Date.now()}.jpg`;
      const croppedFile = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });
      
      // Upload the cropped image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, croppedFile);
        
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
      
      toast.success("Profilbild uppdaterad!");
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      toast.error(`Kunde inte ladda upp bild: ${error.message}`);
    } finally {
      setUploadingImage(false);
      setCropImageUrl(null);
      setSelectedFile(null);
    }
  };

  return (
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
                onChange={handleFileSelect}
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
      
      {/* Image Cropper Dialog */}
      {cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1} // Square aspect ratio for profile image
        />
      )}
    </Card>
  );
};

export default ProfileHeader;
