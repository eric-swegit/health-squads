import { FeedItem } from "./types";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeartAnimation from "./HeartAnimation";

interface FeedItemContentProps {
  item: FeedItem;
  onOpenImage: (imageUrl: string, allImages?: string[]) => void;
  onLike: (item: FeedItem) => void;
}

const FeedItemContent = ({ item, onOpenImage, onLike }: FeedItemContentProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef<number>(0);
  
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

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      e.preventDefault();
      if (!item.userLiked) {
        setShowHeartAnimation(true);
        onLike(item);
      }
    }
    
    lastTapRef.current = now;
  };
  
  return (
    <>
      {photos.length > 0 && (
        <div className="relative overflow-hidden bg-black">
          <HeartAnimation 
            show={showHeartAnimation} 
            onComplete={() => setShowHeartAnimation(false)} 
          />
          
          {/* Photo carousel */}
          <div 
            className="flex select-none"
            style={{
              transform: `translateX(calc(-${currentImageIndex * 100}% + ${touchOffset}px))`,
              transition: isTransitioning || touchOffset === 0 ? 'transform 0.3s ease-out' : 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleDoubleTap}
          >
            {photos.map((photo, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="w-full aspect-[4/5] relative">
                  <img 
                    src={photo} 
                    alt={`${item.activity_name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === currentImageIndex ? "eager" : "lazy"}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation controls for multiple images */}
          {hasMultiplePhotos && (
            <>
              <Button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 h-8 w-8 bg-black/50 hover:bg-black/70 border-0"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  prevImage(); 
                }}
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
              
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 h-8 w-8 bg-black/50 hover:bg-black/70 border-0"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  nextImage(); 
                }}
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
              
              {/* Dots indicator */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {photos.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'w-1.5 bg-white' 
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Caption */}
      <div className="px-4 pt-2">
        <p className="text-sm">
          <span className="font-semibold mr-1">{item.user_name}</span>
          <span>Genomförde <span className="font-medium">{item.activity_name}</span> och tjänade <span className="font-medium text-primary">{item.points}p</span>!</span>
        </p>
      </div>
    </>
  );
};

export default FeedItemContent;
