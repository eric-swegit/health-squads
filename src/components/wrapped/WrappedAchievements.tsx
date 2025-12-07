import { useEffect, useState } from 'react';
import { 
  Award, 
  Flame, 
  Rocket, 
  Trophy, 
  Heart, 
  Droplets, 
  Dumbbell,
  Sunrise,
  Crown,
  Zap
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
}

interface WrappedAchievementsProps {
  achievements: Achievement[];
  onAchievementReveal?: () => void;
}

const getAchievementIcon = (iconType: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'streak': Flame,
    'activities': Rocket,
    'points': Trophy,
    'gratitude': Heart,
    'water': Droplets,
    'workout': Dumbbell,
    'early': Sunrise,
    'crown': Crown,
    'power': Zap,
    'default': Award,
  };
  return iconMap[iconType] || iconMap['default'];
};

const getAchievementColor = (iconType: string) => {
  const colorMap: Record<string, string> = {
    'streak': 'from-orange-400 to-red-500',
    'activities': 'from-purple-400 to-pink-500',
    'points': 'from-amber-400 to-orange-500',
    'gratitude': 'from-rose-400 to-pink-500',
    'water': 'from-blue-400 to-cyan-500',
    'workout': 'from-green-400 to-emerald-500',
    'early': 'from-yellow-400 to-orange-500',
    'crown': 'from-amber-300 to-yellow-500',
    'power': 'from-violet-400 to-purple-500',
    'default': 'from-amber-400 to-orange-500',
  };
  return colorMap[iconType] || colorMap['default'];
};

const WrappedAchievements = ({ achievements, onAchievementReveal }: WrappedAchievementsProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
      if (onAchievementReveal && achievements.length > 0) {
        onAchievementReveal();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [onAchievementReveal, achievements.length]);

  if (achievements.length === 0) {
    return (
      <div className="text-center text-white">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Achievements</h2>
        </div>
        <p className="text-white/70">
          Fortsätt logga aktiviteter för att låsa upp achievements!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center text-white w-full max-w-md">
      <div
        className={`flex items-center justify-center gap-2 mb-8 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Award className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Dina achievements</h2>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement, index) => {
          const IconComponent = getAchievementIcon(achievement.iconType);
          const iconColor = getAchievementColor(achievement.iconType);
          
          return (
            <div
              key={achievement.id}
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 transition-all duration-700 ${
                animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: `${(index + 1) * 200}ms` }}
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${iconColor} flex items-center justify-center shrink-0`}>
                <IconComponent className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold">{achievement.title}</p>
                <p className="text-sm text-white/70">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WrappedAchievements;
