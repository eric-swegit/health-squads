import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface HeartAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const HeartAnimation = ({ show, onComplete }: HeartAnimationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <Heart 
        className="h-24 w-24 text-white fill-white animate-[scale-in_0.3s_ease-out,fade-out_0.5s_ease-out_0.3s]" 
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
};

export default HeartAnimation;
