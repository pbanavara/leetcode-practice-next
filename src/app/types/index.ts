export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
    id: number | null;
    title: string;
    description: string;
    difficulty: Difficulty;
    acceptance_rate: number;
    frequency: number;
    related_topics: string[];
    asked_by_faang: boolean;
    solved: boolean;
    attempts: number;
    last_attempt: Date | null;
    next_review: Date | null;  // When to show again
    interval: number;  // Days until next review

}

export interface PracticeSession {
    sessionId: string;
    currentProblem: Problem;
    totalProblems: number;
    deckName: string;
}

export interface Message {
    type: 'pseudocode' | 'analysis';
    content: string;
    timestamp: number;
}