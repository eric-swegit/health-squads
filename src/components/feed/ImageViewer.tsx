import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useRef } from "react";
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
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex] || null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!hasMultipleImages) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-1 bg-black">
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentImage && (
            <img 
              src={currentImage} 
              alt="Full size" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
          
          {hasMultipleImages && (
            <>
              <Button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 h-10 w-10"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onPrev(); 
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 h-10 w-10"
                variant="secondary"
                size="icon"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onNext(); 
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full px-3 py-1">
                <span className="text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
