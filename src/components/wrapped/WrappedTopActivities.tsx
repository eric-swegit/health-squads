import { useEffect, useState } from 'react';
import { Star, Droplets, Salad, Dumbbell, Home, Footprints, Moon, Heart, Sparkles } from 'lucide-react';

interface Activity {
  name: string;
  count: number;
  iconType: string;
}

interface WrappedTopActivitiesProps {
  activities: Activity[];
}

const getActivityIcon = (iconType: string) => {
  const iconMap: Record<string, React.ElementType> = {
    'water': Droplets,
    'food': Salad,
    'gym': Dumbbell,
    'home': Home,
    'steps': Footprints,
    'sleep': Moon,
    'gratitude': Heart,
    'mindfulness': Sparkles,
    'default': Star,
  };
  return iconMap[iconType] || iconMap['default'];
};

const getIconColor = (iconType: string) => {
  const colorMap: Record<string, string> = {
    'water': 'from-blue-400 to-cyan-500',
    'food': 'from-green-400 to-emerald-500',
    'gym': 'from-purple-400 to-violet-500',
    'home': 'from-orange-400 to-amber-500',
    'steps': 'from-pink-400 to-rose-500',
    'sleep': 'from-indigo-400 to-blue-500',
    'gratitude': 'from-rose-400 to-pink-500',
    'mindfulness': 'from-teal-400 to-cyan-500',
    'default': 'from-amber-400 to-orange-500',
  };
  return colorMap[iconType] || colorMap['default'];
};

const WrappedTopActivities = ({ activities }: WrappedTopActivitiesProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (activities.length === 0) {
    return (
      <div className="text-center text-white">
        <p className="text-xl">Inga aktiviteter ännu</p>
      </div>
    );
  }

  const maxCount = activities[0]?.count || 1;

  return (
    <div className="text-center text-white w-full max-w-md">
      <div
        className={`flex items-center justify-center gap-2 mb-8 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Star className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Dina favoriter</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const percentage = (activity.count / maxCount) * 100;
          const IconComponent = getActivityIcon(activity.iconType);
          const iconColor = getIconColor(activity.iconType);
          
          return (
            <div
              key={activity.name}
              className={`transition-all duration-700 ${
                animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${iconColor} flex items-center justify-center`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-left flex-1 truncate">{activity.name}</span>
                <span className="text-sm font-bold">{activity.count}x</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden ml-11">
                <div
                  className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ${
                    animate ? '' : 'w-0'
                  }`}
                  style={{ 
                    width: animate ? `${percentage}%` : '0%',
                    transitionDelay: `${(index + 1) * 150 + 300}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WrappedTopActivities;
