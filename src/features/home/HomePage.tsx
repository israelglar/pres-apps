import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Code,
  Download,
  ExternalLink,
  History,
  Loader2,
  LogOut,
  RefreshCw,
  Users,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { useHomePageLogic } from "./HomePage.logic";
import { useAuth } from "../../contexts/AuthContext";
import { AttendanceStats } from "../../components/AttendanceStats";
import { DevTools } from "./DevTools";

interface HomePageProps {
  onNavigate: () => void;
  onManageStudents: () => void;
  onViewHistory: () => void;
  onQuickStart?: (date: string, serviceTimeId: number) => void;
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
export function HomePage({
  onNavigate,
  onManageStudents,
  onViewHistory,
  onQuickStart,
}: HomePageProps) {
  const logic = useHomePageLogic({ onNavigate });
  const { teacher, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.solids.background} flex items-center justify-center p-4 relative`}
      onTouchStart={logic.handleTouchStart}
      onTouchMove={logic.handleTouchMove}
      onTouchEnd={logic.handleTouchEnd}
    >
      {/* Dev Tools Button - Fixed top left - Only show in development mode */}
      {import.meta.env.DEV && (
        <button
          onClick={() => logic.setShowDevTools(true)}
          className="fixed top-4 left-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-50"
          aria-label="Dev Tools"
          title="Dev Tools"
        >
          <Code className="w-5 h-5" />
        </button>
      )}

      {/* Sign Out Button - Fixed top right - Only show when authenticated */}
      {teacher && (
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-50"
          aria-label="Sair"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}

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
        className="max-w-md w-full px-4"
        style={{
          transform: `translateX(${logic.swipeOffset}px)`,
          transition: logic.isAnimatingSwipe
            ? "transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)"
            : "none",
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Pré-adolescentes</h1>
          {teacher && (
            <p className="text-sm text-white/80 mt-2">
              Olá, {teacher.name.split(' ')[0]}!
            </p>
          )}
        </div>

        {/* Conditional rendering based on whether today is a lesson day */}
        {logic.isLessonDay && logic.todaySchedules.length > 0 ? (
          // LESSON DAY LAYOUT - Quick attendance flow
          <div className="space-y-3">
            {/* Lesson Details Card */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${theme.backgrounds.primaryLight} p-2 rounded-lg`}>
                  <Calendar className={`w-6 h-6 ${theme.text.primary}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${theme.text.neutral} font-bold uppercase tracking-wide`}>
                    Lição de Hoje
                  </p>
                  {logic.todaySchedules[0].lesson ? (
                    logic.todaySchedules[0].lesson.resource_url ? (
                      <a
                        href={logic.todaySchedules[0].lesson.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-base font-bold ${theme.text.primaryDark} hover:underline flex items-center gap-2`}
                      >
                        {logic.todaySchedules[0].lesson.name}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <p className={`text-base font-bold ${theme.text.primaryDark}`}>
                        {logic.todaySchedules[0].lesson.name}
                      </p>
                    )
                  ) : (
                    <p className="text-base font-bold text-amber-600">
                      Sem lição agendada
                    </p>
                  )}
                </div>
              </div>

              {/* Service Time Selection */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className={`w-4 h-4 ${theme.text.primary}`} />
                  <p className={`text-xs ${theme.text.neutral} font-bold uppercase tracking-wide`}>
                    Escolher Horário
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {logic.todaySchedules.map((schedule) => {
                    // Skip if service_time_id is null
                    if (!schedule.service_time_id) return null;

                    // Check if attendance has been recorded
                    const hasAttendance = schedule.stats && schedule.stats.total > 0;
                    // Calculate total present (including visitors)
                    // Note: visitors might overlap with present/late/excused, but we count all who attended
                    const totalPresent = schedule.stats
                      ? schedule.stats.present + schedule.stats.late + schedule.stats.excused + schedule.stats.visitors
                      : 0;

                    return (
                      <button
                        key={schedule.service_time_id}
                        onClick={() => onQuickStart?.(logic.today, schedule.service_time_id!)}
                        className={`px-3 py-2.5 ${buttonClasses.primary} text-sm flex flex-col items-center justify-center gap-2`}
                      >
                        {/* Top: Clock + Time */}
                        <div className={`flex items-center gap-2 ${!hasAttendance ? 'text-xl' : ''}`}>
                          <Clock className={!hasAttendance ? 'w-5 h-5' : 'w-4 h-4'} />
                          <span className="font-bold">{schedule.serviceTimeTime.substring(0, 5)}</span>
                        </div>

                        {/* Bottom: Attendance stats if available */}
                        {hasAttendance && (
                          <div className="flex items-center gap-2">
                            {/* Total count */}
                            <span className="text-xl font-bold">
                              {totalPresent}
                            </span>
                            {/* Stats circles */}
                            <AttendanceStats stats={schedule.stats!} mode="compact" showAbsent={false} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Choose Another Date Button */}
            <button
              onClick={onNavigate}
              className={`w-full px-5 py-3 ${buttonClasses.secondary} text-sm flex items-center justify-center gap-2`}
            >
              <Calendar className="w-4 h-4" />
              Escolher Outra Data
            </button>
          </div>
        ) : (
          // REGULAR LAYOUT - Date selection flow
          <button
            onClick={logic.handleStartClick}
            className={`w-full bg-white ${theme.text.primary} rounded-xl shadow-xl p-8 hover:scale-105 active:scale-95 transition-transform duration-200 group relative overflow-hidden`}
          >
            {/* Swipe indicator */}
            {logic.swipeOffset < 0 && !logic.isAnimatingSwipe && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  opacity: Math.min(Math.abs(logic.swipeOffset) / 50, 1),
                }}
              >
                <ArrowRight className={`w-6 h-6 ${theme.text.primary}`} />
              </div>
            )}

            <Calendar
              className={`w-16 h-16 mx-auto mb-4 ${theme.text.primary}`}
            />
            <h2 className="text-2xl font-bold mb-1">Registar Presenças</h2>
            <p className={`${theme.text.neutral} text-base font-medium`}>
              Marcar presenças para a lição de hoje
            </p>
          </button>
        )}

        {/* History Button */}
        <button
          onClick={onViewHistory}
          className="w-full bg-white/20 backdrop-blur-sm text-white rounded-lg shadow-lg px-5 py-3 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30 mt-3"
        >
          <History className="w-4 h-4" />
          <span className="font-semibold text-sm">Histórico de Presenças</span>
        </button>

        {/* Manage Students Button */}
        <button
          onClick={onManageStudents}
          className="w-full bg-white/20 backdrop-blur-sm text-white rounded-lg shadow-lg px-5 py-3 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30 mt-3"
        >
          <Users className="w-4 h-4" />
          <span className="font-semibold text-sm">Gerir Prés</span>
        </button>

        {/* PWA Button - Show if app can be installed and not already running in PWA mode */}
        {!logic.isRunningInPWA && logic.canInstall && (
          <button
            onClick={logic.promptInstall}
            className="w-full bg-white/20 backdrop-blur-sm text-white rounded-lg shadow-lg px-5 py-3 hover:bg-white/30 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 border border-white/30 mt-3"
          >
            <Download className="w-4 h-4" />
            <span className="font-semibold text-sm">
              Instalar Aplicação
            </span>
          </button>
        )}

      </div>

      {/* Dev Tools Modal - Only show in development mode */}
      {import.meta.env.DEV && (
        <DevTools
          isOpen={logic.showDevTools}
          onClose={() => logic.setShowDevTools(false)}
        />
      )}

      {/* Loading Overlay - only show when user clicked and we're waiting for data */}
      {logic.waitingForData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 text-center">
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
                    className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={logic.handleRetryLoad}
                    className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-3`}
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
                  A obter dados
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
