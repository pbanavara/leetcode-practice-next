import { Redis } from "ioredis";
import { Problem } from "@/app/types";

type Difficulty = "Easy" | "Medium" | "Hard";

// Review intervals (in days)
const REVIEW_INTERVALS: Record<Difficulty, number> = {
    Easy: 10,
    Medium: 4,
    Hard: 1
};

export async function updateProblemReview(redis: Redis, sessionId: string, problemId: number, difficulty: Difficulty): Promise<void> {
    // Fetch solved problems
    const solvedRaw = await redis.call("JSON.GET", `${sessionId}:problems`, ".");
    const solvedProblems: Problem[] = solvedRaw ? JSON.parse(solvedRaw) : [];

    // Find the problem
    const problemIndex = solvedProblems.findIndex(p => p.id === problemId);
    if (problemIndex === -1) {
        throw new Error(`Problem ${problemId} not found in solved list`);
    }

    const problem = solvedProblems[problemIndex];
    const today = new Date();

    // Update problem review timing
    problem.attempts += 1;
    problem.last_attempt = today;
    problem.interval = REVIEW_INTERVALS[difficulty];
    problem.next_review = new Date(today.getTime() + problem.interval * 24 * 60 * 60 * 1000);

    // Save the updated solved list in Redis
    await redis.call("JSON.SET", `${sessionId}:problems`, ".", JSON.stringify(solvedProblems));
}

export async function getNextProblem(redis: Redis, sessionId: string): Promise<Problem | null> {
    const problems = await redis.get(`${sessionId}:problems`) as string;
    const parsedProblems : Problem[] = problems ? JSON.parse(problems) : [];

    const newProblems = parsedProblems.filter(p => !p.solved);

    const today = new Date();

    // 1️⃣ Prioritize solved problems that are due
    for (const problem of parsedProblems) {
        if (problem.next_review && new Date(problem.next_review) <= today) {
            return problem;
        }
    }

    // 2️⃣ Introduce a new problem if no reviews are due
    if (newProblems.length > 0) {
        const newProblem = newProblems.shift()!;

        newProblem.solved = true;
        newProblem.attempts = 0;
        newProblem.interval = 1;
        newProblem.last_attempt = today;
        newProblem.next_review = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        // Save updates in Redis (atomic batch write)
        await redis.set(`${sessionId}:problems`, JSON.stringify(parsedProblems));
        await redis.set(`${sessionId}:currentIndex`, "0");

        return newProblem;
    }

    return parsedProblems.length > 0 ? parsedProblems[0] : null;
}
