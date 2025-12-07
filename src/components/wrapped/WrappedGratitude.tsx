import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface WrappedGratitudeProps {
  count: number;
  summary: string | null;
}

const WrappedGratitude = ({ count, summary }: WrappedGratitudeProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  let parsedSummary: { summary?: string; themes?: string[]; insight?: string } | null = null;
  if (summary) {
    try {
      parsedSummary = JSON.parse(summary);
    } catch {
      parsedSummary = { summary };
    }
  }

  return (
    <div className="text-center text-white w-full max-w-md">
      <div
        className={`transition-all duration-700 ${
          animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-10 w-10 text-white fill-white" />
        </div>
      </div>

      <div
        className={`flex items-center justify-center gap-2 mb-2 transition-all duration-700 delay-200 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-2xl font-bold">Tacksamhet</h2>
      </div>

      <p
        className={`text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent transition-all duration-700 delay-300 ${
          animate ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        {count * 3}
      </p>

      <p
        className={`text-white/70 mb-6 transition-all duration-700 delay-400 ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
      >
        saker du varit tacksam för
      </p>

      {parsedSummary && (
        <div
          className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left transition-all duration-700 delay-500 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {parsedSummary.summary && (
            <p className="text-sm mb-3">{parsedSummary.summary}</p>
          )}
          
          {parsedSummary.themes && parsedSummary.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {parsedSummary.themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white/20 rounded-full text-xs"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {parsedSummary.insight && (
            <p className="text-xs italic text-white/70 border-l-2 border-pink-400 pl-2">
              "{parsedSummary.insight}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WrappedGratitude;
