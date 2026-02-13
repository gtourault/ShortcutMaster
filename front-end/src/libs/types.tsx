interface Answer {
    question_label: string;
    expected_shortcut: string;
    user_input: string;
    is_correct: boolean;
    response_time_ms: number;
}
type SessionType = 'quizz' | 'training';
interface Session {
    id: number;
    user_id: number;
    played_at: string;
    difficulty: string | null;
    software: string | null;
    system: string | null;
    total_questions: number | null;
    total_correct: number | null;
    total_wrong: number | null;
    average_time_ms: number | null;
    type: SessionType;
    answers: Answer[];
}
interface Shortcut {
    id: number;
    action: string;
    windows: string;
    macos: string;
    linux: string;
    software_id: number;
}

interface HistoryItem {
  action: string;
  correctShortcut: string;
  userInput: string;
  success: boolean;
  skipped?: boolean;
  responseTime?: number;
}

interface Software {
  id: number;
  code: string;
  label: string;
  logo?: string;
  shortcuts_count?: number;
  // facultatif: isFavorite si backend le fournit
  isFavorite?: boolean;
  category?: string;
}

export type { Session, Answer, Shortcut, HistoryItem, Software };