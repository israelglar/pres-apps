import { Code2, LogOut, X, Palette } from 'lucide-react';
import { buttonClasses, theme, themeManager } from '../../config/theme';

interface DevToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dev Tools Modal - Development utilities
 *
 * Features:
 * - Dev login redirect
 * - Date override (mock today's date)
 * - Theme switcher (4 color schemes)
 *
 * Only visible in development mode
 */
export function DevTools({ isOpen, onClose }: DevToolsProps) {
  if (!isOpen) return null;

  const currentTheme = themeManager.getCurrentTheme();
  const themes = themeManager.getThemes();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className={`${theme.backgrounds.primaryLighter} rounded-2xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto border ${theme.borders.primaryLight} animate-scale-in`}>
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between -m-5 mb-5 rounded-t-2xl`}>
          <div className="flex items-center gap-2">
            <Code2 className={`w-5 h-5 ${theme.text.onPrimaryButton}`} />
            <h2 className={`text-xl font-bold ${theme.text.onPrimaryButton}`}>Dev Tools</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className={`w-5 h-5 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Theme Switcher */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className={`w-4 h-4 ${theme.text.primary}`} />
            <h3 className={`text-sm font-bold ${theme.text.primary} uppercase tracking-wide`}>
              Color Theme
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(themes).map(([key, themeData]) => (
              <button
                key={key}
                onClick={() => themeManager.setTheme(key as any)}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  currentTheme === key
                    ? `${theme.solids.primaryButton} ${theme.borders.primary} ${theme.text.onPrimaryButton} shadow-md`
                    : `${theme.backgrounds.white} ${theme.borders.primaryLight} ${theme.text.primary} hover:shadow-md ${theme.borders.primaryHover}`
                }`}
              >
                <div className="font-bold">{themeData.name}</div>
                <div className="text-xs opacity-75 mt-0.5">
                  {themeData.description}
                </div>
              </button>
            ))}
          </div>
          <p className={`text-xs ${theme.text.neutral} mt-2`}>
            Page will reload when you select a theme
          </p>
        </div>

        {/* Dev Login */}
        <div className={`mb-4 pt-4 ${theme.borders.neutralLight} border-t`}>
          <h3 className={`text-sm font-bold ${theme.text.primary} mb-2 uppercase tracking-wide`}>
            Authentication
          </h3>
          <button
            onClick={() => {
              window.location.href = '/dev-login';
            }}
            className={`w-full ${theme.backgrounds.warningLight} ${theme.text.warning} rounded-xl px-4 py-3 hover:shadow-md transition-all flex items-center justify-center gap-2 border ${theme.borders.warning}`}
          >
            <LogOut className="w-4 h-4" />
            <span className="font-semibold text-sm">Dev Login</span>
          </button>
        </div>

        {/* Dev Date Override */}
        <div className={`${theme.borders.neutralLight} border-t pt-4`}>
          <h3 className={`text-sm font-bold ${theme.text.primary} mb-2 uppercase tracking-wide`}>
            Mock Today's Date
          </h3>
          <input
            type="date"
            value={localStorage.getItem('devDate') || ''}
            onChange={(e) => {
              if (e.target.value) {
                localStorage.setItem('devDate', e.target.value);
              } else {
                localStorage.removeItem('devDate');
              }
              window.location.reload();
            }}
            className={`w-full px-4 py-3 rounded-xl text-sm ${theme.text.primary} ${theme.backgrounds.white} border ${theme.borders.primary} focus:ring-4 ${theme.rings.primary} transition-all`}
          />
          {localStorage.getItem('devDate') && (
            <div className={`mt-2 p-3 ${theme.backgrounds.primaryLighter} rounded-xl border ${theme.borders.primary}`}>
              <p className={`text-xs ${theme.text.primary} mb-2`}>
                Currently mocking:{' '}
                <strong>{localStorage.getItem('devDate')}</strong>
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('devDate');
                  window.location.reload();
                }}
                className={`w-full px-3 py-2 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-lg text-xs font-bold hover:shadow-md transition-all`}
              >
                Reset to Real Date
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className={`mt-5 pt-4 ${theme.borders.neutralLight} border-t`}>
          <button
            onClick={onClose}
            className={`w-full px-5 py-3 ${buttonClasses.secondary} text-sm`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
