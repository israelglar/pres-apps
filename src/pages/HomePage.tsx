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
  onRefresh,
  isRefreshing,
  dataError,
  onRetryLoad,
  waitingForData,
  onCancelWaiting,
}: HomePageProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const minPullDistance = 80; // Minimum pull distance to trigger refresh
  const maxPullDistance = 120; // Maximum visual pull distance

  const handleStartClick = () => {
    onStart();
  };

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

      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pré-adolescentes
          </h1>
        </div>

        <button
          onClick={handleStartClick}
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
