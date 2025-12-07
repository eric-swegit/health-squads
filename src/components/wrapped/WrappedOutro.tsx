import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface WrappedOutroProps {
  userName: string;
  totalPoints: number;
}

const WrappedOutro = ({ userName, totalPoints }: WrappedOutroProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

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

      <h2
        className={`text-3xl font-bold mb-4 transition-all duration-1000 delay-300 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Bra jobbat, {userName.split(' ')[0]}! 🎉
      </h2>

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
        <p className="text-lg mb-4">
          Tack för att du varit en del av HealthSquad! 💪
        </p>
        <p className="text-sm text-white/70">
          Fortsätt att ta hand om dig själv och inspirera andra. 
          Vi ses nästa gång! 🌟
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

export default WrappedOutro;
