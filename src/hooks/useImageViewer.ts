
import { useState } from "react";

export const useImageViewer = () => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageDialog = (imageUrl: string, allImages?: string[]) => {
    if (allImages && allImages.length > 0) {
      setSelectedImages(allImages);
      setCurrentImageIndex(allImages.indexOf(imageUrl));
    } else {
      setSelectedImages([imageUrl]);
      setCurrentImageIndex(0);
    }
    setImageDialogOpen(true);
  };

  const nextImage = () => {
    if (selectedImages.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % selectedImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImages.length > 1) {
      setCurrentImageIndex(prev => (prev - 1 + selectedImages.length) % selectedImages.length);
    }
  };

  return {
    imageDialogOpen,
    setImageDialogOpen,
    selectedImages,
    currentImageIndex,
    openImageDialog,
    nextImage,
    prevImage
  };
};
