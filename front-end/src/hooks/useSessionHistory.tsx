import { useMemo, useState, useEffect } from "react";
import type { HistoryItem } from "../libs/types";

export function useSessionHistory(initial: HistoryItem[] = []) {
  const [history, setHistory] = useState<HistoryItem[]>(initial);
  const push = (item: HistoryItem) => setHistory(h => [...h, item]);
  const clear = () => setHistory([]);

  const grouped = useMemo(() => {
    return history.reduce<Record<string, HistoryItem[]>>((acc, cur) => {
      acc[cur.action] = acc[cur.action] || [];
      acc[cur.action].push(cur);
      return acc;
    }, {});
  }, [history]);
  const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});
      // 🔹 Toggle des détails dans l'historique
      const toggleDetails = (action: string) => {
          setDetailsOpen(prev => ({
              ...prev,
              [action]: !prev[action]
          }));
      };
      useEffect(() => {
    if (history.length === 0) return;

    const uniqueLastActions: string[] = [];
    for (let i = history.length - 1; i >= 0 && uniqueLastActions.length < 2; i--) {
      const action = history[i].action;
      if (!uniqueLastActions.includes(action)) {
        uniqueLastActions.push(action);
      }
    }

    setDetailsOpen(() => {
      const newState: Record<string, boolean> = {};
      Object.keys(grouped).forEach(action => {
        newState[action] = uniqueLastActions.includes(action);
      });
      return newState;
    });
  }, [history, grouped]);

  return { history, push, clear, grouped, toggleDetails, detailsOpen, setDetailsOpen, successCount: history.filter(h => h.success).length };
}
