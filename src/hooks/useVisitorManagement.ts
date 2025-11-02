/**
 * Visitor Management Hook
 * Handles adding visitors during attendance marking with smart search
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Fuse from 'fuse.js';
import { addVisitor } from '../api/supabase/students';
import { ATTENDANCE_QUERY_KEY } from './useAttendanceData';
import { selectionTap } from '../utils/haptics';

// Minimal Student interface for visitor management
export interface Student {
  id: string;
  name: string;
  isVisitor?: boolean;
}

interface VisitorManagementReturn {
  isVisitorDialogOpen: boolean;
  searchQuery: string;
  searchResults: Student[];
  selectedVisitor: Student | null;
  showResults: boolean;
  firstTimeAtChurch: string | null;
  willComeRegularly: string | null;
  isAddingVisitor: boolean;
  error: string | null;
  openVisitorDialog: () => void;
  closeVisitorDialog: () => void;
  handleSearchChange: (query: string) => void;
  handleSelectVisitor: (visitor: Student) => void;
  handleClearSelection: () => void;
  setFirstTimeAtChurch: (value: string) => void;
  setWillComeRegularly: (value: string) => void;
  addNewVisitor: () => Promise<{ student: Student; notes: string } | null>;
  markExistingVisitor: () => { student: Student; notes: string } | null;
}

export function useVisitorManagement(visitorStudents: Student[]): VisitorManagementReturn {
  const queryClient = useQueryClient();
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Student | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [firstTimeAtChurch, setFirstTimeAtChurch] = useState<string | null>(null);
  const [willComeRegularly, setWillComeRegularly] = useState<string | null>(null);
  const [isAddingVisitor, setIsAddingVisitor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fuse.js instance for searching existing visitors
  const fuse = useMemo(() => {
    return new Fuse(visitorStudents, {
      keys: ["name"],
      threshold: 0.3, // Same as main search
      includeScore: true,
    });
  }, [visitorStudents]);

  const openVisitorDialog = () => {
    setIsVisitorDialogOpen(true);
    setError(null);
  };

  const closeVisitorDialog = () => {
    setIsVisitorDialogOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedVisitor(null);
    setShowResults(false);
    setFirstTimeAtChurch(null);
    setWillComeRegularly(null);
    setError(null);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = fuse.search(query);
    setSearchResults(results.map(r => r.item));
    setShowResults(true);
  };

  const handleSelectVisitor = (visitor: Student) => {
    setSelectedVisitor(visitor);
    setSearchQuery(visitor.name);
    setShowResults(false);
    selectionTap(); // Haptic feedback
  };

  const handleClearSelection = () => {
    setSelectedVisitor(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const markExistingVisitor = (): { student: Student; notes: string } | null => {
    if (!selectedVisitor) return null;

    // No notes for existing visitors
    const notes = '';

    selectionTap();
    closeVisitorDialog(); // Reset all state

    return { student: selectedVisitor, notes };
  };

  const addNewVisitor = async (): Promise<{ student: Student; notes: string } | null> => {
    const trimmedName = searchQuery.trim();

    // Don't create if visitor is selected
    if (selectedVisitor) {
      setError('Visitante já selecionado. Use "Marcar Presente".');
      return null;
    }

    if (!trimmedName) {
      setError('Por favor, insira um nome');
      return null;
    }

    setIsAddingVisitor(true);
    setError(null);

    try {
      // Call API to create visitor in database
      const newVisitor = await addVisitor(trimmedName);

      // Build notes from question answers
      const notesArray: string[] = [];
      if (firstTimeAtChurch !== null) {
        notesArray.push(`Primeira vez na igreja? ${firstTimeAtChurch === 'yes' ? 'Sim' : 'Não'}`);
      }
      if (willComeRegularly !== null) {
        notesArray.push(`Vai vir regularmente? ${willComeRegularly === 'yes' ? 'Sim' : 'Não'}`);
      }
      const notes = notesArray.join(' | ');

      // Haptic feedback for success
      selectionTap();

      // Invalidate React Query cache to refetch students
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEY });

      // Close dialog and reset form
      closeVisitorDialog();

      // Convert DatabaseStudent to our simple Student type
      const studentForAttendance: Student = {
        id: String(newVisitor.id),
        name: newVisitor.name,
        isVisitor: true
      };

      return { student: studentForAttendance, notes };
    } catch (err) {
      console.error('Error adding visitor:', err);
      setError('Erro ao adicionar visitante. Tente novamente.');
      return null;
    } finally {
      setIsAddingVisitor(false);
    }
  };

  return {
    isVisitorDialogOpen,
    searchQuery,
    searchResults,
    selectedVisitor,
    showResults,
    firstTimeAtChurch,
    willComeRegularly,
    isAddingVisitor,
    error,
    openVisitorDialog,
    closeVisitorDialog,
    handleSearchChange,
    handleSelectVisitor,
    handleClearSelection,
    setFirstTimeAtChurch,
    setWillComeRegularly,
    addNewVisitor,
    markExistingVisitor,
  };
}
