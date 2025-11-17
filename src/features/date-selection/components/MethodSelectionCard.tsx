import { ArrowDownAZ, Info, Search, UserCheck } from "lucide-react";
import { theme } from "../../../config/theme";

interface MethodSelectionCardProps {
  selectedMethod: "search" | "swipe";
  showMethodInfo: "search" | "swipe" | null;
  onSelectMethod: (method: "search" | "swipe") => void;
  onToggleMethodInfo: (method: "search" | "swipe") => void;
  onCloseMethodInfo: () => void;
}

export function MethodSelectionCard({
  selectedMethod,
  showMethodInfo,
  onSelectMethod,
  onToggleMethodInfo,
  onCloseMethodInfo,
}: MethodSelectionCardProps) {
  return (
    <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-3`}>
      <p className={`text-xs ${theme.text.primary} font-bold uppercase tracking-wide mb-2 flex items-center gap-2`}>
        <Search className="w-4 h-4" />
        Método
      </p>
      <div className="grid grid-cols-2 gap-2">
        {/* Search Method - DEFAULT */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectMethod("search")}
            className={`w-full p-2 rounded-xl border-2 transition-all ${
              selectedMethod === "search"
                ? `${theme.borders.secondary} ${theme.backgrounds.secondaryLight50} shadow-md`
                : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
            }`}
          >
            <UserCheck className={`w-5 h-5 mx-auto mb-1 ${
              selectedMethod === "search" ? "text-blue-600" : theme.text.neutral
            }`} />
            <p className={`font-semibold text-xs ${theme.text.neutralDarker} whitespace-nowrap overflow-hidden text-ellipsis`}>
              Só Presentes
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMethodInfo("search");
            }}
            className={`absolute top-1.5 right-1.5 p-1 ${theme.backgrounds.white} hover:bg-gray-100 rounded-full transition-colors shadow-sm`}
          >
            <Info className="w-3.5 h-3.5 text-blue-600" />
          </button>
          {showMethodInfo === "search" && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={onCloseMethodInfo}
              />
              <div className={`fixed left-1/2 -translate-x-1/2 bottom-32 w-72 max-w-[calc(100vw-2rem)] p-4 ${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.secondary} shadow-2xl z-50 animate-fade-in`}>
                <p className={`text-sm ${theme.text.neutral}`}>
                  Ideal para registar pela ordem em que estão sentados.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Swipe Method */}
        <div className="relative">
          <button
            type="button"
            onClick={() => onSelectMethod("swipe")}
            className={`w-full p-2 rounded-xl border-2 transition-all ${
              selectedMethod === "swipe"
                ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter} shadow-md`
                : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
            }`}
          >
            <ArrowDownAZ className={`w-5 h-5 mx-auto mb-1 ${
              selectedMethod === "swipe" ? theme.text.primary : theme.text.neutral
            }`} />
            <p className={`font-semibold text-xs ${theme.text.neutralDarker} whitespace-nowrap overflow-hidden text-ellipsis`}>
              Alfabética
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMethodInfo("swipe");
            }}
            className={`absolute top-1.5 right-1.5 p-1 ${theme.backgrounds.white} hover:bg-gray-100 rounded-full transition-colors shadow-sm`}
          >
            <Info className={`w-3.5 h-3.5 ${theme.text.primary}`} />
          </button>
          {showMethodInfo === "swipe" && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={onCloseMethodInfo}
              />
              <div className={`fixed left-1/2 -translate-x-1/2 bottom-32 w-72 max-w-[calc(100vw-2rem)] p-4 ${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primary} shadow-2xl z-50 animate-fade-in`}>
                <p className={`text-sm ${theme.text.neutral}`}>
                  Percorre todos para marcar presente ou falta.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
