import Redis from 'ioredis';
import { Problem, Message } from '@/app/types/index';

export class RedisManager {
    private redis: Redis;
    private PROBLEM_CACHE_TTL = 3600; // 1 hour cache TTL

    private static instance: RedisManager;

    private constructor() {
        this.redis = new Redis(
            'redis://default:8zYjYy6ySk86q1tP6Tm826KLLqlVIP0C@redis-11035.c281.us-east-1-2.ec2.redns.redis-cloud.com:11035'
        );

        this.redis.on('connect', () => {
            console.log('Connected to Redis Cloud');
        });
    }

    public static getInstance(): RedisManager {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }

    async getProblemById(problemId: number): Promise<Problem | null> {
        const cachedProblem = await this.redis.get(`problem:${problemId}`);
        if (cachedProblem) {
            return JSON.parse(cachedProblem) as Problem;
        }

        // TODO: Implement database connection
        // For now, returning null as placeholder
        return null;
    }

    async setUserProblems(sessionId: string, problems: Problem[]): Promise<void> {
        const sessionKey = `${sessionId}:problems`;
        await this.redis.set(sessionKey, JSON.stringify(problems));
        await this.redis.set(`${sessionId}:current_index`, '0');
    }

    async getUserProblems(sessionId: string): Promise<Problem[] | null> {
        const sessionKey = `${sessionId}:problems`;
        console.log("Inside redis fetch next problem", sessionKey)
        const problems = await this.redis.get(sessionKey);
        return problems ? JSON.parse(problems) : null;
    }

    async getProblemAttempts(sessionId: string, problemId: number): Promise<number> {
        const userProblemsKey = `${sessionId}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return 0;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        return problem?.attempts || 0;
    }

    async incrementProblemAttempt(sessionId: string, problemId: number): Promise<void> {
        const sessionProblemsKey = `${sessionId}:problems`;
        const problems = await this.redis.get(sessionProblemsKey);
        if (!problems) return;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);

        if (problem) {
            problem.attempts = (problem.attempts || 0) + 1;
            await this.redis.set(sessionProblemsKey, JSON.stringify(parsedProblems));
        }
    }


    async markProblemSolved(sessionId: string, problemId: number): Promise<void> {
        const userProblemsKey = `${sessionId}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        if (problem) {
            problem.solved = true;
            await this.redis.set(userProblemsKey, JSON.stringify(parsedProblems));
            await this.redis.sadd(`${sessionId}:solved`, problemId);
        }
    }

    async isProblemSolved(sessionId: string, problemId: number): Promise<boolean> {
        const userProblemsKey = `${sessionId}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return false;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        return problem?.solved || false;
    }

    async setCurrentIndex(sessionId: string, index: number): Promise<void> {
        const sessionKey = `${sessionId}:current_index`;
        await this.redis.set(sessionKey, index);
        console.log("Inside redis set current index", index);
    }


    async getCurrentIndex(sessionId: string): Promise<number> {
        const sessionKey = `${sessionId}:currentIndex`;
        const index = await this.redis.get(sessionKey);
        
        return parseInt(index || '0');
    }

    async appendChatHistory(userId: string,
                            sessionId: string,
                            problemId: string,
                            messages: Message[]): Promise<void> {
        const sessionKey = `${sessionId}:${problemId}:chat_history`;
        const sessionHistory = JSON.parse(await this.redis.get(sessionKey) || '[]');
        const updatedHistory = [...sessionHistory, ...messages];
        await this.redis.set(sessionKey, JSON.stringify(updatedHistory));
        
        const userKey = `${userId}:chat_history`;
        const userHistory = JSON.parse(await this.redis.get(userKey) || '[]');
        const updatedUserHistory = [...userHistory, ...messages];
        await this.redis.set(userKey, JSON.stringify(updatedUserHistory));

    }

    async getChatHistory(sessionId: string, problemId: string): Promise<Message[]> {
        const sessionKey = `${sessionId}:${problemId}:chat_history`;
        const history = await this.redis.get(sessionKey);
        return history ? JSON.parse(history) : [];
    }

    async checkFirstTimeUser(userId: string): Promise<boolean> {
        const key = `${userId}:onboarded`;
        const hasOnboarded = await this.redis.get(key);
        if (!hasOnboarded) {
            await this.redis.set(key, 'true');
            return true;
        }
        return false;
    }

    async getSessionProgress(sessionId: string): Promise<{
        completed: number;
        remaining: number;
    }> {
        const totalProblems = await this.redis.get(`${sessionId}:problems`) as string;
        const parsedProblems: Problem[] = JSON.parse(totalProblems);
        console.log("Inside redis get session progress", parsedProblems);
        const solvedProblems = parsedProblems.filter(problem => problem.solved);

        return {
            completed: solvedProblems.length,
            remaining: parsedProblems.length - solvedProblems.length
        };
    }

    async getNextProblem(sessionId: string): Promise<Problem | null> {
        const problems = await this.redis.get(`${sessionId}:problems`) as string;
        const parsedProblems: Problem[] = problems ? JSON.parse(problems) : [];

        const newProblems = parsedProblems.filter(p => !p.solved);

        const today = new Date();

        // 1️⃣ Prioritize solved problems that are due
        for (const problem of parsedProblems) {
            if (problem.next_review && new Date(problem.next_review) <= today) {
                const problemIndex = parsedProblems.findIndex(p => p.id === problem.id);
                await this.redis.set(`${sessionId}:currentIndex`, problemIndex);
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
            const newProblemIndex = parsedProblems.findIndex(p => p.id === newProblem.id);

            // Save updates in Redis (atomic batch write)
            await this.redis.set(`${sessionId}:problems`, JSON.stringify(parsedProblems));
            await this.redis.set(`${sessionId}:currentIndex`, newProblemIndex);

            return newProblem;
        }

        return parsedProblems.length > 0 ? parsedProblems[0] : null;
    }

}
