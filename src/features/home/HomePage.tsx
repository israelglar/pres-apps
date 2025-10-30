import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Loader2,
  RefreshCw,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useHomePageLogic } from './HomePage.logic';

interface HomePageProps {
  onNavigate: () => void;
}

/**
 * Home Page - Landing page with gesture-based navigation
 *
 * Features:
 * - Swipe left to navigate to date selection
 * - Pull down to refresh data
 * - Loading state overlay
 * - Error handling
 */
export function HomePage({ onNavigate }: HomePageProps) {
  const logic = useHomePageLogic({ onNavigate });

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4 relative"
      onTouchStart={logic.handleTouchStart}
      onTouchMove={logic.handleTouchMove}
      onTouchEnd={logic.handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(logic.pullDistance > 0 || logic.isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200"
          style={{
            transform: `translateY(${logic.isRefreshing ? 40 : logic.pullDistance / 2}px)`,
            opacity: logic.isRefreshing
              ? 1
              : Math.min(logic.pullDistance / logic.minPullDistance, 1),
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <Loader2
              className={`w-6 h-6 text-emerald-600 ${
                logic.isRefreshing || logic.pullDistance >= logic.minPullDistance
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </div>
        </div>
      )}

      <div
        className="max-w-md w-full"
        style={{
          transform: `translateX(${logic.swipeOffset}px)`,
          transition: logic.isAnimatingSwipe
            ? 'transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)'
            : 'none',
        }}
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Pré-adolescentes
          </h1>
        </div>

        <button
          onClick={logic.handleStartClick}
          className="w-full bg-white text-emerald-600 rounded-2xl shadow-2xl p-12 hover:scale-105 active:scale-95 transition-transform duration-200 group relative overflow-hidden"
        >
          {/* Swipe indicator */}
          {logic.swipeOffset < 0 && !logic.isAnimatingSwipe && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                opacity: Math.min(Math.abs(logic.swipeOffset) / 50, 1),
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

        {/* PWA Install Button */}
        {logic.canInstall && (
          <div className="mt-6">
            <button
              onClick={logic.promptInstall}
              className="w-full bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg px-6 py-4 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Instalar Aplicação</span>
            </button>
          </div>
        )}

        {/* PWA Installed Message */}
        {logic.isInstalled && (
          <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center justify-center gap-3 border border-white/30">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Aplicação Instalada</span>
          </div>
        )}
      </div>

      {/* Loading Overlay - only show when user clicked and we're waiting for data */}
      {logic.waitingForData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            {logic.dataError ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Erro ao Carregar
                </h2>
                <p className="text-gray-600 mb-8">{logic.dataError}</p>
                <div className="flex gap-3">
                  <button
                    onClick={logic.handleCancelWaiting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all border-2 border-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={logic.handleRetryLoad}
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
}
