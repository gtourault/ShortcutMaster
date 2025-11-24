interface Answer {
    question_label: string;
    expected_shortcut: string;
    user_input: string;
    is_correct: boolean;
    response_time_ms: number;
}

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
    type: string | null;
    answers: Answer[];
}

export type { Session, Answer };
