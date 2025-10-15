import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

interface HomePageProps {
  onStart: () => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const HomePage = ({ onStart, onRefresh, isRefreshing }: HomePageProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const minPullDistance = 80; // Minimum pull distance to trigger refresh
  const maxPullDistance = 120; // Maximum visual pull distance

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow pull-to-refresh if at the top of the page
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || isRefreshing) return;

    const currentTouch = e.touches[0].clientY;
    const distance = currentTouch - touchStart;

    // Only show pull indicator if pulling down
    if (distance > 0) {
      setPullDistance(Math.min(distance, maxPullDistance));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= minPullDistance && !isRefreshing) {
      await onRefresh();
    }

    setTouchStart(null);
    setPullDistance(0);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200"
          style={{
            transform: `translateY(${isRefreshing ? 40 : pullDistance / 2}px)`,
            opacity: isRefreshing ? 1 : Math.min(pullDistance / minPullDistance, 1),
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Loader2
              className={`w-6 h-6 text-emerald-600 ${
                isRefreshing || pullDistance >= minPullDistance ? "animate-spin" : ""
              }`}
            />
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pré-adolescentes
          </h1>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-white text-emerald-600 rounded-2xl shadow-2xl p-12 hover:scale-105 active:scale-95 transition-transform duration-200 group"
        >
          <Calendar className="w-24 h-24 mx-auto mb-6 text-emerald-600" />
          <h2 className="text-3xl font-bold mb-2">Registar Presenças</h2>
          <p className="text-gray-600 text-lg">
            Marcar presenças para a lição de hoje
          </p>
          <div className="mt-6 flex items-center justify-center text-emerald-600 font-semibold">
            <span>Começar</span>
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
