export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: Difficulty;
    acceptance_rate: number;
    frequency: number;
    related_topics: string[];
    asked_by_faang: boolean;
}

export interface PracticeSession {
    session_id: string;
    current_problem: Problem;
    total_problems: number;
}
