
import { CardContent } from "@/components/ui/card";
import { FeedItem } from "./types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeedItemContentProps {
  item: FeedItem;
  onOpenImage: (imageUrl: string, allImages?: string[]) => void;
}

const FeedItemContent = ({ item, onOpenImage }: FeedItemContentProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Check if we have multiple photos
  const hasMultiplePhotos = Array.isArray(item.photo_urls) && item.photo_urls.length > 1;
  const photos = hasMultiplePhotos ? item.photo_urls : (item.photo_url ? [item.photo_url] : []);
  const currentPhoto = photos[currentImageIndex];
  
  const nextImage = () => {
    setIsTransitioning(true);
    setCurrentImageIndex(prev => (prev + 1) % photos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };
  
  const prevImage = () => {
    setIsTransitioning(true);
    setCurrentImageIndex(prev => (prev - 1 + photos.length) % photos.length);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultiplePhotos) return;
    setTouchStart(e.touches[0].clientX);
    setTouchOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!hasMultiplePhotos || touchStart === 0) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    setTouchOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!hasMultiplePhotos) return;
    
    const minSwipeDistance = 50;

    if (Math.abs(touchOffset) > minSwipeDistance) {
      if (touchOffset < 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
    
    setTouchStart(0);
    setTouchOffset(0);
  };
  
  return (
    <CardContent className="p-4">
      <p className="mb-2">
        Genomförde <span className="font-medium">{item.activity_name}</span> och tjänade <span className="font-medium text-purple-600">{item.points}p</span>!
      </p>
      
      {photos.length > 0 && (
        <div className="mt-3 relative overflow-hidden rounded-lg">
          {/* Photo carousel */}
          <div 
            className="flex cursor-pointer"
            style={{
              transform: `translateX(calc(-${currentImageIndex * 100}% + ${touchOffset}px))`,
              transition: isTransitioning || touchOffset === 0 ? 'transform 0.3s ease-out' : 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => onOpenImage(currentPhoto, photos)}
          >
            {photos.map((photo, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <img 
                  src={photo} 
                  alt={`${item.activity_name} ${index + 1}`}
                  className="w-full h-auto max-h-[300px] object-contain bg-black"
                  loading={index === currentImageIndex ? "eager" : "lazy"}
                />
              </div>
            ))}
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
