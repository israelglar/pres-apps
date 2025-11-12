/**
 * Visitor Dialog Component
 * Handles adding visitors with search functionality and questions for new visitors
 */

import React from 'react';
import { CheckCircle, Search, UserPlus } from 'lucide-react';
import { buttonClasses, inputClasses, theme } from '../../config/theme';
import type { Student } from '../../types/attendance.types';

interface VisitorManagement {
  isVisitorDialogOpen: boolean;
  searchQuery: string;
  searchResults: Student[];
  selectedVisitor: Student | null;
  showResults: boolean;
  firstTimeAtChurch: string | null;
  willComeRegularly: string | null;
  isAddingVisitor: boolean;
  error: string | null;
  closeVisitorDialog: () => void;
  handleSearchChange: (query: string) => void;
  handleSelectVisitor: (visitor: Student) => void;
  handleClearSelection: () => void;
  setFirstTimeAtChurch: (value: string) => void;
  setWillComeRegularly: (value: string) => void;
}

interface VisitorDialogProps {
  visitorManagement: VisitorManagement;
  onAddVisitor: () => void | Promise<void> | Promise<Student | null>;
}

export const VisitorDialog: React.FC<VisitorDialogProps> = ({
  visitorManagement,
  onAddVisitor,
}) => {
  if (!visitorManagement.isVisitorDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl max-w-md w-full p-5 animate-in fade-in zoom-in duration-200`}>
        <div className="text-center mb-6">
          <div
            className={`w-16 h-16 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <UserPlus className={`w-8 h-8 ${theme.text.primary}`} />
          </div>
          <h3 className={`text-base font-bold ${theme.text.neutralDarker} mb-2`}>
            {visitorManagement.selectedVisitor
              ? "Marcar Visitante"
              : "Adicionar Visitante"}
          </h3>
          <p className={`${theme.text.neutral} text-sm mb-4`}>
            {visitorManagement.selectedVisitor
              ? "Este visitante já existe. Clique para marcar presente."
              : "Procure por visitantes existentes ou adicione um novo. Será marcado como presente automaticamente."}
          </p>
        </div>

        <div className="space-y-4 mb-5">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Nome do Visitante
            </label>
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.primary} w-4 h-4 z-10`}
              />
              <input
                type="text"
                value={visitorManagement.searchQuery}
                onChange={(e) =>
                  visitorManagement.handleSearchChange(e.target.value)
                }
                placeholder="Procurar ou criar visitante..."
                className={`w-full pl-10 pr-4 py-3 text-sm ${inputClasses}`}
                autoFocus
                disabled={visitorManagement.isAddingVisitor}
              />
            </div>

            {/* Search Results Dropdown - Only show if there are results */}
            {visitorManagement.showResults &&
              visitorManagement.searchResults.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 ${theme.backgrounds.white} border-2 ${theme.borders.neutralLight} rounded-xl shadow-lg max-h-48 overflow-y-auto`}>
                  <ul className="py-1">
                    {visitorManagement.searchResults.map((visitor) => (
                      <li
                        key={visitor.id}
                        onClick={() =>
                          visitorManagement.handleSelectVisitor(visitor)
                        }
                        className={`px-4 py-3 ${theme.backgrounds.primaryHover} cursor-pointer transition-colors border-b ${theme.borders.neutralLight} last:border-b-0`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${theme.text.neutralDarker}`}>
                            {visitor.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 ${theme.solids.badge} ${theme.text.white} text-xs font-bold rounded-full`}
                          >
                            Visitante
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {visitorManagement.error && (
              <p className={`${theme.text.error} text-xs mt-2`}>
                {visitorManagement.error}
              </p>
            )}
          </div>

          {/* Selected Visitor Card */}
          {visitorManagement.selectedVisitor && (
            <div
              className={`p-3 ${theme.solids.cardPrimary} rounded-xl border-2 ${theme.borders.successLight}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className={`w-5 h-5 ${theme.text.primary}`}
                  />
                  <span className={`text-sm font-bold ${theme.text.neutralDarker}`}>
                    {visitorManagement.selectedVisitor.name}
                  </span>
                </div>
                <button
                  onClick={visitorManagement.handleClearSelection}
                  className={`${theme.text.neutralMedium} hover:${theme.text.neutralDark} transition-colors`}
                  aria-label="Limpar seleção"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Questions - Only show for new visitors */}
          {!visitorManagement.selectedVisitor && (
            <>
              {/* Question 1: First time at church? */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Primeira vez na igreja?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      visitorManagement.setFirstTimeAtChurch("yes")
                    }
                    className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                      visitorManagement.firstTimeAtChurch === "yes"
                        ? `${theme.solids.primaryButton} ${theme.text.white} border-transparent`
                        : `${theme.backgrounds.white} ${theme.borders.neutral} ${theme.text.neutralDark} ${theme.backgrounds.neutralHover}`
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      visitorManagement.setFirstTimeAtChurch("no")
                    }
                    className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                      visitorManagement.firstTimeAtChurch === "no"
                        ? `${theme.solids.primaryButton} ${theme.text.white} border-transparent`
                        : `${theme.backgrounds.white} ${theme.borders.neutral} ${theme.text.neutralDark} ${theme.backgrounds.neutralHover}`
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* Question 2: Will come regularly? - Only show if first time at church */}
              {visitorManagement.firstTimeAtChurch === "yes" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Vai começar a vir regularmente?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        visitorManagement.setWillComeRegularly("yes")
                      }
                      className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                        visitorManagement.willComeRegularly === "yes"
                          ? `${theme.solids.primaryButton} ${theme.text.white} border-transparent`
                          : `${theme.backgrounds.white} ${theme.borders.neutral} ${theme.text.neutralDark} ${theme.backgrounds.neutralHover}`
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        visitorManagement.setWillComeRegularly("no")
                      }
                      className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
                        visitorManagement.willComeRegularly === "no"
                          ? `${theme.solids.primaryButton} ${theme.text.white} border-transparent`
                          : `${theme.backgrounds.white} ${theme.borders.neutral} ${theme.text.neutralDark} ${theme.backgrounds.neutralHover}`
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={visitorManagement.closeVisitorDialog}
            disabled={visitorManagement.isAddingVisitor}
            className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
          >
            Cancelar
          </button>
          <button
            onClick={onAddVisitor}
            disabled={
              !visitorManagement.searchQuery.trim() ||
              visitorManagement.isAddingVisitor
            }
            className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {visitorManagement.isAddingVisitor
              ? "A processar..."
              : visitorManagement.selectedVisitor
                ? "Marcar Presente"
                : "Adicionar Visitante"}
          </button>
        </div>
      </div>
    </div>
  );
};
