
import { CardContent } from "@/components/ui/card";
import { FeedItem } from "./types";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeedItemContentProps {
  item: FeedItem;
  onOpenImage: (imageUrl: string, allImages?: string[]) => void;
}

const FeedItemContent = ({ item, onOpenImage }: FeedItemContentProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // Check if we have multiple photos
  const hasMultiplePhotos = Array.isArray(item.photo_urls) && item.photo_urls.length > 1;
  const photos = hasMultiplePhotos ? item.photo_urls : (item.photo_url ? [item.photo_url] : []);
  const currentPhoto = photos[currentImageIndex];
  
  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % photos.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!hasMultiplePhotos) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - go to next image
        nextImage();
      } else {
        // Swiped right - go to previous image
        prevImage();
      }
    }
  };
  
  return (
    <CardContent className="p-4">
      <p className="mb-2">
        Genomförde <span className="font-medium">{item.activity_name}</span> och tjänade <span className="font-medium text-purple-600">{item.points}p</span>!
      </p>
      
      {photos.length > 0 && (
        <div className="mt-3 relative">
          {/* Photo */}
          <div 
            className="rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onOpenImage(currentPhoto, photos)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={currentPhoto} 
              alt={item.activity_name}
              className="w-full h-auto max-h-[300px] object-contain bg-black"
              loading="lazy"
            />
          </div>
          
          {/* Navigation controls for multiple images */}
          {hasMultiplePhotos && (
            <>
              <Button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 h-8 w-8"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  prevImage(); 
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 h-8 w-8"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  nextImage(); 
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Photo counter indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-2 py-1">
                <span className="text-white text-xs">
                  {currentImageIndex + 1} / {photos.length}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </CardContent>
  );
};

export default FeedItemContent;
