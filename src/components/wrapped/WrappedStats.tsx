import { useEffect, useState } from 'react';
import { Activity, Flame, Calendar, Trophy } from 'lucide-react';

interface WrappedStatsProps {
  totalActivities: number;
  totalPoints: number;
  longestStreak: number;
  daysActive: number;
}

const WrappedStats = ({ totalActivities, totalPoints, longestStreak, daysActive }: WrappedStatsProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: Activity, label: 'Aktiviteter', value: totalActivities, color: 'from-pink-500 to-rose-500' },
    { icon: Trophy, label: 'Poäng', value: totalPoints, color: 'from-amber-500 to-orange-500' },
    { icon: Flame, label: 'Längsta streak', value: `${longestStreak} dagar`, color: 'from-red-500 to-orange-500' },
    { icon: Calendar, label: 'Aktiva dagar', value: daysActive, color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <div className="text-center text-white w-full max-w-md">
      <h2
        className={`text-2xl font-bold mb-8 transition-all duration-700 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        Din statistik 📊
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 transition-all duration-700 ${
              animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: `${(index + 1) * 150}ms` }}
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WrappedStats;
