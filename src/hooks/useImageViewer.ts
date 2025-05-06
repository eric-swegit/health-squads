
import { useState } from "react";

export const useImageViewer = () => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImageDialog = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  return {
    imageDialogOpen,
    setImageDialogOpen,
    selectedImage,
    openImageDialog
  };
};
