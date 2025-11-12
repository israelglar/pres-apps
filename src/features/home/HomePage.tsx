import React from "react";
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
  Menu,
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
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div
      className={`min-h-screen ${theme.backgrounds.page} relative`}
      onTouchStart={logic.handleTouchStart}
      onTouchMove={logic.handleTouchMove}
      onTouchEnd={logic.handleTouchEnd}
    >
      {/* Dev Tools Button - Fixed top left - Only show in development mode */}
      {import.meta.env.DEV && (
        <button
          onClick={() => logic.setShowDevTools(true)}
          className={`fixed top-4 left-4 p-2 ${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primaryLight} rounded-lg ${theme.backgrounds.primaryHover} hover:shadow-md transition-all z-50`}
          aria-label="Dev Tools"
          title="Dev Tools"
        >
          <Code className="w-5 h-5" />
        </button>
      )}

      {/* Pull-to-refresh indicator */}
      {(logic.pullDistance > 0 || logic.isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200 z-40"
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

      {/* Main Content Container */}
      <div className="flex flex-col items-center min-h-screen py-8 px-4">
        <div
          className="max-w-md w-full space-y-6"
          style={{
            transform: `translateX(${logic.swipeOffset}px)`,
            transition: logic.isAnimatingSwipe
              ? "transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)"
              : "none",
          }}
        >
          {/* Header Section */}
          <div className="space-y-4">
            {/* User Menu Button Row */}
            {teacher && (
              <div className="flex justify-end relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`p-2 ${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primaryLight} rounded-lg ${theme.backgrounds.primaryHover} hover:shadow-md transition-all`}
                  aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className={`absolute right-0 top-full mt-2 ${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primary} shadow-2xl z-50 min-w-[180px]`}>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setShowUserMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left ${theme.backgrounds.primaryHover} transition-all flex items-center gap-3 rounded-xl ${theme.text.neutralDarker}`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium text-sm">Sair</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Title and Greeting */}
            <div className="text-center">
              <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Pré-adolescentes</h1>
              {teacher && (
                <p className={`text-base ${theme.text.neutral}`}>
                  Olá, {teacher.name.split(' ')[0]}!
                </p>
              )}
            </div>
          </div>

          {/* Conditional rendering based on whether today is a lesson day */}
          {logic.isLessonDay && logic.todaySchedules.length > 0 ? (
            // LESSON DAY LAYOUT - Quick attendance flow
            <div className="space-y-4">
              {/* Lesson Details Card */}
              <div className={`${theme.backgrounds.white} rounded-xl shadow-md p-5 border-2 ${theme.borders.primaryLight}`}>
                <div className="mb-4">
                  <p className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-2 flex items-center gap-2`}>
                    <Calendar className="w-4 h-4" />
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

                {/* Service Time Selection */}
                <div className={`border-t ${theme.borders.neutralLight} pt-4`}>
                  <p className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-3 flex items-center gap-2`}>
                    <Clock className="w-4 h-4" />
                    Escolher Horário
                  </p>
                  <div className="flex gap-3">
                    {logic.todaySchedules.map((schedule) => {
                      // Skip if service_time_id is null
                      if (!schedule.service_time_id) return null;

                      // Check if attendance has been recorded
                      const hasAttendance = schedule.stats && schedule.stats.total > 0;
                      // Calculate total present (including visitors)
                      const totalPresent = schedule.stats
                        ? schedule.stats.present + schedule.stats.late + schedule.stats.excused + schedule.stats.visitors
                        : 0;

                      return (
                        <button
                          key={schedule.service_time_id}
                          onClick={() => onQuickStart?.(logic.today, schedule.service_time_id!)}
                          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 ${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover} transition-all cursor-pointer`}
                        >
                          {/* Top: Clock + Time */}
                          <div className={`flex items-center gap-2 ${!hasAttendance ? 'text-base' : 'text-sm'}`}>
                            <Clock className={`w-4 h-4 ${theme.text.primary}`} />
                            <span className={`font-bold ${theme.text.primaryDarker}`}>{schedule.serviceTimeTime.substring(0, 5)}</span>
                          </div>

                          {/* Bottom: Attendance stats if available */}
                          {hasAttendance && (
                            <div className="flex items-center gap-2 mt-2">
                              {/* Total count */}
                              <span className={`text-xl font-bold ${theme.text.primary}`}>
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
              <div className={`${theme.backgrounds.white} rounded-xl shadow-md border-2 ${theme.borders.primaryLight}`}>
                <button
                  onClick={onNavigate}
                  className={`w-full px-5 py-4 ${theme.backgrounds.primaryHover} rounded-xl transition-all flex items-center justify-center gap-3`}
                >
                  <Calendar className={`w-5 h-5 ${theme.text.primary}`} />
                  <span className={`font-semibold text-sm ${theme.text.primary}`}>Escolher Outra Data</span>
                </button>
              </div>
            </div>
          ) : (
            // REGULAR LAYOUT - Date selection flow
            <div className={`${theme.backgrounds.white} rounded-xl shadow-md border-2 ${theme.borders.primaryLight} relative overflow-hidden`}>
              <button
                onClick={logic.handleStartClick}
                className={`w-full p-8 ${theme.backgrounds.primaryHover} rounded-xl transition-all group`}
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

                <Calendar className={`w-16 h-16 mx-auto mb-4 ${theme.text.primary}`} />
                <h2 className={`text-2xl font-bold mb-2 ${theme.text.primary}`}>Registar Presenças</h2>
                <p className={`${theme.text.neutral} text-sm`}>
                  Marcar presenças para a lição de hoje
                </p>
              </button>
            </div>
          )}

          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* History Button */}
            <div className={`${theme.backgrounds.white} rounded-xl shadow-md border-2 ${theme.borders.primaryLight}`}>
              <button
                onClick={onViewHistory}
                className={`w-full p-4 ${theme.backgrounds.primaryHover} rounded-xl transition-all flex flex-col items-center justify-center gap-2`}
              >
                <History className={`w-6 h-6 ${theme.text.primary}`} />
                <span className={`font-semibold text-sm ${theme.text.primary} text-center`}>Histórico</span>
              </button>
            </div>

            {/* Manage Students Button */}
            <div className={`${theme.backgrounds.white} rounded-xl shadow-md border-2 ${theme.borders.primaryLight}`}>
              <button
                onClick={onManageStudents}
                className={`w-full p-4 ${theme.backgrounds.primaryHover} rounded-xl transition-all flex flex-col items-center justify-center gap-2`}
              >
                <Users className={`w-6 h-6 ${theme.text.primary}`} />
                <span className={`font-semibold text-sm ${theme.text.primary} text-center`}>Gerir Prés</span>
              </button>
            </div>

            {/* PWA Button - Show if app can be installed and not already running in PWA mode */}
            {!logic.isRunningInPWA && logic.canInstall && (
              <div className={`${theme.backgrounds.white} rounded-xl shadow-md border-2 ${theme.borders.primaryLight} col-span-2`}>
                <button
                  onClick={logic.promptInstall}
                  className={`w-full p-4 ${theme.backgrounds.primaryHover} rounded-xl transition-all flex items-center justify-center gap-3`}
                >
                  <Download className={`w-5 h-5 ${theme.text.primary}`} />
                  <span className={`font-semibold text-sm ${theme.text.primary}`}>
                    Instalar Aplicação
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
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
