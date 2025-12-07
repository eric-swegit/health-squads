import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WrappedIntroProps {
  userName: string;
  profileImage: string | null;
}

const WrappedIntro = ({ userName, profileImage }: WrappedIntroProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center text-white">
      <div
        className={`transition-all duration-1000 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Avatar className="w-24 h-24 mx-auto mb-6 border-4 border-white/30">
          <AvatarImage src={profileImage || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white text-2xl">
            {userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <h1
        className={`text-4xl font-bold mb-4 transition-all duration-1000 delay-300 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Hej {userName.split(' ')[0]}!
      </h1>

      <div
        className={`transition-all duration-1000 delay-500 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <p className="text-xl text-white/80 mb-2">Välkommen till din</p>
        <h2 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          HealthSquad
        </h2>
        <h2 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          Wrapped 2025
        </h2>
      </div>

      <p
        className={`text-white/60 mt-8 transition-all duration-1000 delay-700 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Svep för att se din resa 👉
      </p>
    </div>
  );
};

export default WrappedIntro;
