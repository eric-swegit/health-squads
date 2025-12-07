import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WrappedSlideshowProps {
  photos: string[];
}

const WrappedSlideshow = ({ photos }: WrappedSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, photos.length]);

  const goToPrev = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % photos.length);
  }, [photos.length]);

  if (photos.length === 0) {
    return (
      <div className="text-center text-white">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="h-10 w-10 text-white/50" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Dina minnen 📸</h2>
        <p className="text-white/70">
          Ladda upp bilder till dina aktiviteter för att se dem här!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-white w-full max-w-md">
      <h2
        className={`text-2xl font-bold mb-6 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Dina minnen 📸
      </h2>

      <div
        className={`relative transition-all duration-700 delay-200 ${
          animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* Main image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/20">
          <img
            src={photos[currentIndex]}
            alt={`Memory ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Progress bar */}
          {photos.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / photos.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Photo count */}
        <p className="mt-4 text-white/70 text-sm">
          {currentIndex + 1} av {photos.length} bilder
        </p>

        {/* Thumbnail preview */}
        {photos.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
            {photos.slice(0, 10).map((photo, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                  index === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {photos.length > 10 && (
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xs shrink-0">
                +{photos.length - 10}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WrappedSlideshow;
