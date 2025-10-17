import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

interface HomePageProps {
  onStart: () => void;
  onNavigate: () => void;
  canNavigate: boolean;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  isDataReady: boolean;
  isLoading: boolean;
  dataError: string | null;
  onRetryLoad: () => void;
  waitingForData: boolean;
  onCancelWaiting: () => void;
}

export const HomePage = ({
  onStart,
  onNavigate,
  canNavigate,
  onRefresh,
  isRefreshing,
  dataError,
  onRetryLoad,
  waitingForData,
  onCancelWaiting,
}: HomePageProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);

  const minPullDistance = 80; // Minimum pull distance to trigger refresh
  const maxPullDistance = 120; // Maximum visual pull distance
  const minSwipeDistance = 50; // Minimum swipe distance to trigger navigation

  const handleStartClick = () => {
    onStart();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't allow new gestures while animating
    if (isAnimatingSwipe) return;

    // Store both X and Y coordinates
    setTouchStart(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setSwipeOffset(0);
    setPullDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || touchStartY === null || isRefreshing || isAnimatingSwipe) return;

    const currentTouchX = e.touches[0].clientX;
    const currentTouchY = e.touches[0].clientY;
    const distanceX = currentTouchX - touchStart;
    const distanceY = currentTouchY - touchStartY;

    // Determine if gesture is more horizontal or vertical
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      // Horizontal swipe - only allow left swipe
      if (distanceX < 0) {
        setSwipeOffset(Math.max(-150, distanceX));
      }
    } else if (window.scrollY === 0 && distanceY > 0) {
      // Vertical pull - only show pull indicator if pulling down and at top
      setPullDistance(Math.min(distanceY, maxPullDistance));
    }
  };

  const handleTouchEnd = async () => {
    if (touchStart === null || touchStartY === null) return;

    const currentSwipeOffset = swipeOffset;
    const currentPullDistance = pullDistance;

    // Check for swipe left gesture
    if (Math.abs(currentSwipeOffset) > minSwipeDistance && canNavigate) {
      // Trigger swipe animation - slide fully off screen quickly
      setIsAnimatingSwipe(true);
      setSwipeOffset(-window.innerWidth);

      // Navigate almost immediately to create seamless transition
      setTimeout(() => {
        onNavigate();
      }, 50); // Very short delay to start the animation

      // Don't reset states - let the page unmount with the animation in progress
      setTouchStart(null);
      setTouchStartY(null);
      return;
    }
    // Check for pull-to-refresh
    else if (currentPullDistance >= minPullDistance && !isRefreshing) {
      await onRefresh();
    }

    // Reset states only if not navigating
    setTouchStart(null);
    setTouchStartY(null);
    setPullDistance(0);
    setSwipeOffset(0);
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
            opacity: isRefreshing
              ? 1
              : Math.min(pullDistance / minPullDistance, 1),
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Loader2
              className={`w-6 h-6 text-emerald-600 ${
                isRefreshing || pullDistance >= minPullDistance
                  ? "animate-spin"
                  : ""
              }`}
            />
          </div>
        </div>
      )}

      <div
        className="max-w-md w-full"
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isAnimatingSwipe
            ? "transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)"
            : "none",
        }}
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pré-adolescentes
          </h1>
        </div>

        <button
          onClick={handleStartClick}
          className="w-full bg-white text-emerald-600 rounded-2xl shadow-2xl p-12 hover:scale-105 active:scale-95 transition-transform duration-200 group relative overflow-hidden"
        >
          {/* Swipe indicator */}
          {swipeOffset < 0 && !isAnimatingSwipe && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                opacity: Math.min(Math.abs(swipeOffset) / minSwipeDistance, 1),
              }}
            >
              <ArrowRight className="w-8 h-8 text-emerald-600" />
            </div>
          )}

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

        {/* Swipe hint text */}
        <p className="text-white/70 text-center mt-4 text-sm">
          Deslize para a esquerda para começar
        </p>
      </div>

      {/* Loading Overlay - only show when user clicked and we're waiting for data */}
      {waitingForData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            {dataError ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Erro ao Carregar
                </h2>
                <p className="text-gray-600 mb-8">{dataError}</p>
                <div className="flex gap-3">
                  <button
                    onClick={onCancelWaiting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all border-2 border-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={onRetryLoad}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-lg active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                </div>
              </>
            ) : (
              <>
                <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  A carregar...
                </h2>
                <p className="text-gray-600">A obter dados do Google Sheets</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
