import { useEffect, useState, useCallback } from 'react';
import { Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WrappedOutroProps {
  userName: string;
  totalPoints: number;
  onCelebration?: () => void;
}

const WrappedOutro = ({ userName, totalPoints, onCelebration }: WrappedOutroProps) => {
  const [animate, setAnimate] = useState(false);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    frame();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
      fireConfetti();
      if (onCelebration) {
        onCelebration();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [fireConfetti, onCelebration]);

  return (
    <div className="text-center text-white">
      <div
        className={`transition-all duration-1000 ${
          animate ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </div>

      <div
        className={`flex items-center justify-center gap-2 mb-4 transition-all duration-1000 delay-300 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-3xl font-bold">Bra jobbat, {userName.split(' ')[0]}!</h2>
        <PartyPopper className="h-7 w-7" />
      </div>

      <p
        className={`text-xl text-white/80 mb-8 transition-all duration-1000 delay-500 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Du har samlat <span className="font-bold text-amber-400">{totalPoints} poäng</span> och gjort massor av hälsosamma val.
      </p>

      <div
        className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all duration-1000 delay-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <p className="text-lg">Tack för att du varit en del av HealthSquad!</p>
          <Dumbbell className="h-5 w-5" />
        </div>
        <p className="text-sm text-white/70">
          Fortsätt att ta hand om dig själv och inspirera andra. 
          Vi ses nästa gång!
        </p>
      </div>

      <p
        className={`text-white/50 text-sm mt-8 transition-all duration-1000 delay-1000 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
      >
        #HealthSquadWrapped2025
      </p>
    </div>
  );
};

// Need to import this for the component
import { Dumbbell } from 'lucide-react';

export default WrappedOutro;
