import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

interface WrappedAchievementsProps {
  achievements: Achievement[];
}

const WrappedAchievements = ({ achievements }: WrappedAchievementsProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (achievements.length === 0) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Achievements 🏅</h2>
        <p className="text-white/70">
          Fortsätt logga aktiviteter för att låsa upp achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-white w-full max-w-md">
      <h2
        className={`text-2xl font-bold mb-8 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Dina achievements 🏅
      </h2>

      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 transition-all duration-700 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{ transitionDelay: `${(index + 1) * 200}ms` }}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shrink-0">
              {achievement.emoji}
            </div>
            <div className="text-left">
              <p className="font-bold">{achievement.title}</p>
              <p className="text-sm text-white/70">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WrappedAchievements;
