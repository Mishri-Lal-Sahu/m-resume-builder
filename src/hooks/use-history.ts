import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState({
    present: initialState,
    past: [] as T[],
    future: [] as T[],
  });

  const set = useCallback((newPresent: T | ((prev: T) => T), skipHistory = false) => {
    setState((curr) => {
      const nextPresent = typeof newPresent === "function" 
        ? (newPresent as any)(curr.present) 
        : newPresent;

      if (skipHistory) {
        return {
          ...curr,
          present: nextPresent,
        };
      }

      return {
        past: [...curr.past, curr.present].slice(-50),
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
