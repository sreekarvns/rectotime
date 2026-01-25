import { useState, useCallback, useRef } from 'react';
import { Goal, GoalSchema, safeParseArray } from '../types';
import { sanitizeText } from '../utils/sanitize';
import { storage } from '../utils/storage';

// Maximum undo history size
const MAX_UNDO_STACK = 10;

/**
 * Custom hook for managing goal operations
 * Handles add, update, delete with localStorage persistence, validation, and undo support
 */
export const useGoalManagement = (initialGoals?: Goal[]) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (initialGoals) return safeParseArray(GoalSchema, initialGoals, []);
    return storage.getGoals();
  });

  // Undo stack stored in ref to avoid re-renders
  const undoStack = useRef<Goal[][]>([]);
  const redoStack = useRef<Goal[][]>([]);

  // Save current state to undo stack
  const pushUndoState = useCallback(() => {
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO_STACK + 1), goals];
    redoStack.current = []; // Clear redo on new action
  }, [goals]);

  // Persist goals to storage
  const persistGoals = useCallback((newGoals: Goal[]) => {
    setGoals(newGoals);
    storage.saveGoals(newGoals);
  }, []);

  const addGoal = useCallback((goalData: Omit<Goal, 'id'>) => {
    pushUndoState();
    
    // Sanitize text inputs
    const sanitizedData = {
      ...goalData,
      title: sanitizeText(goalData.title),
      description: sanitizeText(goalData.description),
      unit: sanitizeText(goalData.unit),
    };

    const newGoal: Goal = {
      ...sanitizedData,
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    };

    setGoals((prev) => {
      const updated = [...prev, newGoal];
      storage.saveGoals(updated);
      return updated;
    });
  }, [pushUndoState]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    pushUndoState();
    
    // Sanitize if title or description is being updated
    const sanitizedUpdates = { ...updates };
    if (updates.title) sanitizedUpdates.title = sanitizeText(updates.title);
    if (updates.description) sanitizedUpdates.description = sanitizeText(updates.description);
    if (updates.unit) sanitizedUpdates.unit = sanitizeText(updates.unit);

    setGoals((prev) => {
      const updated = prev.map((goal) =>
        goal.id === id ? { ...goal, ...sanitizedUpdates } : goal
      );
      storage.saveGoals(updated);
      return updated;
    });
  }, [pushUndoState]);

  const deleteGoal = useCallback((id: string) => {
    pushUndoState();
    
    setGoals((prev) => {
      const updated = prev.filter((goal) => goal.id !== id);
      storage.saveGoals(updated);
      return updated;
    });
  }, [pushUndoState]);

  // Undo last operation
  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return false;
    
    const previousState = undoStack.current.pop();
    if (previousState) {
      redoStack.current.push(goals);
      persistGoals(previousState);
      return true;
    }
    return false;
  }, [goals, persistGoals]);

  // Redo last undone operation
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return false;
    
    const nextState = redoStack.current.pop();
    if (nextState) {
      undoStack.current.push(goals);
      persistGoals(nextState);
      return true;
    }
    return false;
  }, [goals, persistGoals]);

  // Check if undo/redo is available
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Bulk operations
  const bulkUpdateGoals = useCallback((updates: Array<{ id: string; changes: Partial<Goal> }>) => {
    pushUndoState();
    
    setGoals((prev) => {
      const updated = prev.map((goal) => {
        const update = updates.find(u => u.id === goal.id);
        if (update) {
          const sanitizedChanges = { ...update.changes };
          if (update.changes.title) sanitizedChanges.title = sanitizeText(update.changes.title);
          if (update.changes.description) sanitizedChanges.description = sanitizeText(update.changes.description);
          return { ...goal, ...sanitizedChanges };
        }
        return goal;
      });
      storage.saveGoals(updated);
      return updated;
    });
  }, [pushUndoState]);

  // Clear completed goals
  const clearCompleted = useCallback(() => {
    pushUndoState();
    
    setGoals((prev) => {
      const updated = prev.filter((goal) => !goal.completed);
      storage.saveGoals(updated);
      return updated;
    });
  }, [pushUndoState]);

  // Reset all goals
  const resetGoals = useCallback(() => {
    pushUndoState();
    persistGoals([]);
  }, [pushUndoState, persistGoals]);

  return { 
    goals, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    undo,
    redo,
    canUndo,
    canRedo,
    bulkUpdateGoals,
    clearCompleted,
    resetGoals,
  };
};

export default useGoalManagement;
