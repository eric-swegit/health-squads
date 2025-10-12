import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

const ImageViewer = ({ open, onOpenChange, images, currentIndex, onNext, onPrev }: ImageViewerProps) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasMultipleImages = images.length > 1;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    setTouchStart(e.touches[0].clientX);
    setTouchOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!hasMultipleImages || touchStart === 0) return;
    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart;
    setTouchOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!hasMultipleImages) return;
    
    const minSwipeDistance = 50;

    if (Math.abs(touchOffset) > minSwipeDistance) {
      setIsTransitioning(true);
      if (touchOffset < 0) {
        onNext();
      } else {
        onPrev();
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    setTouchStart(0);
    setTouchOffset(0);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    onNext();
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    onPrev();
    setTimeout(() => setIsTransitioning(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-1 bg-black overflow-hidden">
        <div 
          className="flex"
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${touchOffset}px))`,
            transition: isTransitioning || touchOffset === 0 ? 'transform 0.3s ease-out' : 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <img 
                src={image} 
                alt={`Image ${index + 1}`} 
                className="w-full h-auto max-h-[80vh] object-contain"
                loading={index === currentIndex ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
          
        {hasMultipleImages && (
          <>
            <Button 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 h-10 w-10 z-10"
              variant="secondary"
              size="icon"
              onClick={(e) => { 
                e.stopPropagation(); 
                handlePrev(); 
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 h-10 w-10 z-10"
              variant="secondary"
              size="icon"
              onClick={(e) => { 
                e.stopPropagation(); 
                handleNext(); 
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-3 py-1 z-10">
              <span className="text-white text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
