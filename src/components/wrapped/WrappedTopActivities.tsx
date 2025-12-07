import { useEffect, useState } from 'react';

interface Activity {
  name: string;
  count: number;
  emoji: string;
}

interface WrappedTopActivitiesProps {
  activities: Activity[];
}

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
      <h2
        className={`text-2xl font-bold mb-8 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Dina favoriter ⭐
      </h2>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const percentage = (activity.count / maxCount) * 100;
          return (
            <div
              key={activity.name}
              className={`transition-all duration-700 ${
                animate ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{activity.emoji}</span>
                <span className="text-sm text-left flex-1 truncate">{activity.name}</span>
                <span className="text-sm font-bold">{activity.count}x</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
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
