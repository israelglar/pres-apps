import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { useHomePageLogic } from "./HomePage.logic";

interface HomePageProps {
  onNavigate: () => void;
  onManageStudents: () => void;
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
export function HomePage({ onNavigate, onManageStudents }: HomePageProps) {
  const logic = useHomePageLogic({ onNavigate });

  return (
    <div
      className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4 relative`}
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
              className={`w-6 h-6 ${theme.text.primary} ${
                logic.isRefreshing ||
                logic.pullDistance >= logic.minPullDistance
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
          transform: `translateX(${logic.swipeOffset}px)`,
          transition: logic.isAnimatingSwipe
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
          onClick={logic.handleStartClick}
          className={`w-full bg-white ${theme.text.primary} rounded-2xl shadow-2xl p-12 hover:scale-105 active:scale-95 transition-transform duration-200 group relative overflow-hidden`}
        >
          {/* Swipe indicator */}
          {logic.swipeOffset < 0 && !logic.isAnimatingSwipe && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                opacity: Math.min(Math.abs(logic.swipeOffset) / 50, 1),
              }}
            >
              <ArrowRight className={`w-8 h-8 ${theme.text.primary}`} />
            </div>
          )}

          <Calendar
            className={`w-24 h-24 mx-auto mb-6 ${theme.text.primary}`}
          />
          <h2 className="text-3xl font-bold mb-2">Registar Presenças</h2>
          <p className={`${theme.text.neutral} text-lg`}>
            Marcar presenças para a lição de hoje
          </p>
          <div
            className={`mt-6 flex items-center justify-center ${theme.text.primary} font-semibold`}
          >
            <span>Começar</span>
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </div>
        </button>

        {/* Manage Students Button */}
        <button
          onClick={onManageStudents}
          className="w-full bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg px-6 py-4 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30 mt-4"
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">Gerir Alunos</span>
        </button>

        {/* PWA Button - Only show if NOT running in PWA mode */}
        {!logic.isRunningInPWA && (
          <div className="mt-6">
            {logic.canInstall ? (
              // Show install button if app can be installed
              <button
                onClick={logic.promptInstall}
                className="w-full bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg px-6 py-4 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Instalar Aplicação</span>
              </button>
            ) : (
              // Show "Open App" button if in browser but app might be installed
              <button
                onClick={logic.openPWAApp}
                className="w-full bg-white/20 backdrop-blur-sm text-white rounded-xl shadow-lg px-6 py-4 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Abrir Aplicação</span>
              </button>
            )}
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
                <p className={`${theme.text.neutral} mb-8`}>
                  {logic.dataError}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={logic.handleCancelWaiting}
                    className={`flex-1 px-4 py-3 ${buttonClasses.secondary} text-sm`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={logic.handleRetryLoad}
                    className={`flex-1 px-4 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-2`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                </div>
              </>
            ) : (
              <>
                <Loader2
                  className={`w-16 h-16 ${theme.text.primary} mx-auto mb-4 animate-spin`}
                />
                <h2
                  className={`text-2xl font-bold ${theme.text.neutralDarker} mb-2`}
                >
                  A carregar...
                </h2>
                <p className={theme.text.neutral}>
                  A obter dados do Google Sheets
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
