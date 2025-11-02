import {
  ArrowLeft,
  History as HistoryIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { useAttendanceHistoryLogic } from "./AttendanceHistoryPage.logic";
import { DateGroupCard } from "./components/DateGroupCard";
import { EditAttendanceDialog } from "./components/EditAttendanceDialog";

interface AttendanceHistoryPageProps {
  onBack: () => void;
}

/**
 * Attendance History Page
 * View and edit past attendance records
 */
export function AttendanceHistoryPage({ onBack }: AttendanceHistoryPageProps) {
  const {
    history,
    isLoading,
    error,
    isDialogOpen,
    selectedRecord,
    isEditing,
    canLoadMore,
    selectedServiceTime,
    handleServiceTimeChange,
    handleOpenEdit,
    handleCloseEdit,
    handleSubmitEdit,
    handleLoadMore,
    handleRefresh,
  } = useAttendanceHistoryLogic();

  return (
    <div
      className={`fixed inset-0 ${theme.gradients.background} overflow-y-auto`}
    >
      <div className="max-w-4xl mx-auto p-3 pb-20">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">Voltar</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Histórico de Presenças
                </h1>
                <p className="text-white/80 text-base mt-0.5 font-medium">
                  Ver e editar registos anteriores
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Service Time Tabs */}
        <div className="mb-5">
          <div className="flex gap-1.5 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            <button
              onClick={() => handleServiceTimeChange("11:00:00")}
              className={`flex-1 px-5 py-3 rounded-md font-bold text-sm transition-all ${
                selectedServiceTime === "11:00:00"
                  ? "bg-white text-cyan-700 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
            >
              11:00
            </button>
            <button
              onClick={() => handleServiceTimeChange("09:00:00")}
              className={`flex-1 px-5 py-3 rounded-md font-bold text-sm transition-all ${
                selectedServiceTime === "09:00:00"
                  ? "bg-white text-cyan-700 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
            >
              09:00
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && !history && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
            <p className="text-white text-base font-semibold">
              A carregar histórico...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-5 text-center">
            <p className="text-red-800 font-semibold mb-2 text-base">
              Erro ao carregar histórico
            </p>
            <p className="text-red-700 text-sm mb-4">{error.toString()}</p>
            <button
              onClick={handleRefresh}
              className={`${buttonClasses.danger} px-5 py-3 text-sm`}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && history && history.length === 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-12 text-center">
            <HistoryIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-base font-semibold mb-2">
              Nenhum histórico disponível
            </p>
            <p className="text-white/80 text-sm">
              Ainda não existem registos de presenças
            </p>
          </div>
        )}

        {/* History List */}
        {history && history.length > 0 && (
          <div className="space-y-3">
            {history.map((group) => (
              <DateGroupCard
                key={group.schedule.id}
                group={group}
                onEditRecord={handleOpenEdit}
              />
            ))}

            {/* Load More Button */}
            {canLoadMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className={`${buttonClasses.secondary} px-5 py-3 text-sm bg-white/90 hover:bg-white disabled:opacity-50 flex items-center gap-3`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />A carregar...
                    </>
                  ) : (
                    "Carregar Mais"
                  )}
                </button>
              </div>
            )}

            {/* End of List Message */}
            {!canLoadMore && history.length >= 5 && (
              <div className="text-center py-4">
                <p className="text-white/70 text-sm">Fim do histórico</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && selectedRecord && (
        <EditAttendanceDialog
          record={selectedRecord}
          onClose={handleCloseEdit}
          onSubmit={handleSubmitEdit}
          isSubmitting={isEditing}
        />
      )}
    </div>
  );
}
