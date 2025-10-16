import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatDate,
  getClosestSunday,
  getLessonName,
} from "../utils/helperFunctions";

export const DateSelectionPage = ({
  onDateSelected,
  onBack,
  allSundays,
  lessonNames,
}) => {
  const [selectedDate, setSelectedDate] = useState(getClosestSunday());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closestSunday = getClosestSunday();

  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const isPreviousSunday = (date: Date) => {
    return date.toDateString() === closestSunday.toDateString() && !isToday(date);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return "Hoje";
    } else if (isPreviousSunday(date)) {
      return "Domingo Passado";
    }
    return null;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Selecionar Data
          </h1>
          <p className="text-emerald-50 text-base font-medium">
            Escolha o domingo para registar as presenças
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6">
          <div className="mb-5">
            <label className="block text-gray-800 font-bold mb-3 text-base">
              Data da Lição
            </label>

            {/* Custom Select Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-base border-2 border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 cursor-pointer bg-gradient-to-r from-white to-emerald-50/30 hover:from-emerald-50/50 hover:to-emerald-100/50 hover:border-emerald-400 transition-all shadow-md hover:shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-1.5 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-bold text-gray-800 text-sm">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {allSundays.map((sunday) => {
                    const isSelected =
                      sunday.toDateString() === selectedDate.toDateString();
                    const dateLabel = getDateLabel(sunday);

                    return (
                      <button
                        key={sunday.toISOString()}
                        type="button"
                        onClick={() => {
                          setSelectedDate(sunday);
                          setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-all flex items-center justify-between border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                          isSelected ? "bg-gradient-to-r from-emerald-100 to-emerald-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full transition-all ${isSelected ? "bg-emerald-600 scale-125" : "bg-gray-300"}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${isSelected ? "text-emerald-900" : "text-gray-800"}`}>
                                {formatDate(sunday)}
                              </span>
                              {dateLabel && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-sm">
                                  {dateLabel}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs ${isSelected ? "text-emerald-700 font-medium" : "text-gray-600"}`}>
                              {getLessonName(sunday, lessonNames)}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-emerald-100 p-1 rounded-full">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4 mb-5 shadow-inner">
            <div className="flex items-center justify-center">
              <div className="bg-white p-2 rounded-xl shadow-md mr-3">
                <Calendar className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide">
                  Data Selecionada
                </p>
                <p className="text-xl font-bold text-emerald-800 my-0.5">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-teal-700 font-semibold text-sm">
                  {getLessonName(selectedDate, lessonNames)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-base hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all flex items-center justify-center border-2 border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            <button
              onClick={() => onDateSelected(selectedDate)}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white rounded-xl font-bold text-base hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center shadow-lg"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
