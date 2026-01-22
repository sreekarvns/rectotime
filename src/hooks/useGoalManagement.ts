import { useState, useCallback } from 'react';
import { Goal } from '../types';

/**
 * Custom hook for managing goal operations
 * Handles add, update, delete with localStorage persistence
 */
export const useGoalManagement = (initialGoals?: Goal[]) => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    if (initialGoals) return initialGoals;
    const stored = localStorage.getItem('productivity_goals');
    return stored ? JSON.parse(stored) : [];
  });

  const addGoal = useCallback((goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Date.now().toString(),
    } as Goal;
    setGoals((prev: Goal[]) => {
      const updated = [...prev, newGoal];
      localStorage.setItem('productivity_goals', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev: Goal[]) => {
      const updated = prev.map((goal: Goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      );
      localStorage.setItem('productivity_goals', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev: Goal[]) => {
      const updated = prev.filter((goal: Goal) => goal.id !== id);
      localStorage.setItem('productivity_goals', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { goals, addGoal, updateGoal, deleteGoal };
};

export default useGoalManagement;
