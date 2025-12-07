import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWrappedData } from '@/hooks/useWrappedData';
import { useWrappedAudio } from '@/hooks/useWrappedAudio';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Volume2, VolumeX } from 'lucide-react';
import WrappedIntro from '@/components/wrapped/WrappedIntro';
import WrappedStats from '@/components/wrapped/WrappedStats';
import WrappedTopActivities from '@/components/wrapped/WrappedTopActivities';
import WrappedAchievements from '@/components/wrapped/WrappedAchievements';
import WrappedGratitude from '@/components/wrapped/WrappedGratitude';
import WrappedSlideshow from '@/components/wrapped/WrappedSlideshow';
import WrappedOutro from '@/components/wrapped/WrappedOutro';
import { Skeleton } from '@/components/ui/skeleton';

type SlideType = 'intro' | 'stats' | 'top-activities' | 'achievements' | 'gratitude' | 'slideshow' | 'outro';

const SLIDES: SlideType[] = ['intro', 'stats', 'top-activities', 'achievements', 'gratitude', 'slideshow', 'outro'];

const WrappedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, generateWrapped } = useWrappedData(user?.id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isPlaying, isMuted, fadeIn, fadeOut, toggleMute, playTransitionSound } = useWrappedAudio();

  useEffect(() => {
    if (user?.id) {
      generateWrapped();
    }
  }, [user?.id, generateWrapped]);

  // Start music when data loads
  useEffect(() => {
    if (data && !isPlaying) {
      fadeIn(2000);
    }
  }, [data, isPlaying, fadeIn]);

  // Fade out when leaving
  useEffect(() => {
    return () => {
      fadeOut(500);
    };
  }, [fadeOut]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      playTransitionSound();
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      playTransitionSound();
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Min HealthSquad Wrapped 2025',
          text: `Jag loggade ${data?.totalActivities} aktiviteter och samlade ${data?.totalPoints} poäng! 💪`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Laddar din Wrapped...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Kunde inte ladda din Wrapped</p>
          <Button onClick={() => navigate('/profile')} variant="outline">
            Tillbaka till profilen
          </Button>
        </div>
      </div>
    );
  }

  const renderSlide = () => {
    switch (SLIDES[currentSlide]) {
      case 'intro':
        return <WrappedIntro userName={data.userName} profileImage={data.profileImage} />;
      case 'stats':
        return (
          <WrappedStats
            totalActivities={data.totalActivities}
            totalPoints={data.totalPoints}
            longestStreak={data.longestStreak}
            daysActive={data.daysActive}
          />
        );
      case 'top-activities':
        return <WrappedTopActivities activities={data.topActivities} />;
      case 'achievements':
        return <WrappedAchievements achievements={data.achievements} />;
      case 'gratitude':
        return (
          <WrappedGratitude
            count={data.gratitudeCount}
            summary={data.gratitudeSummary}
          />
        );
      case 'slideshow':
        return <WrappedSlideshow photos={data.photos} />;
      case 'outro':
        return <WrappedOutro userName={data.userName} totalPoints={data.totalPoints} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white hover:bg-white/10"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          {SLIDES[currentSlide] === 'outro' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white hover:bg-white/10"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>

      {/* Slide content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 pt-20 pb-24">
        {renderSlide()}
      </div>

      {/* Navigation dots */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-2 z-50">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex justify-between z-50">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="text-white hover:bg-white/10 disabled:opacity-0"
        >
          Föregående
        </Button>
        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentSlide === SLIDES.length - 1}
          className="text-white hover:bg-white/10 disabled:opacity-0"
        >
          Nästa
        </Button>
      </div>
    </div>
  );
};

export default WrappedPage;
