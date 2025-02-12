import Redis from 'ioredis';
import { Problem, Message } from '@/app/types/index';

export class RedisManager {
    private redis: Redis;
    private PROBLEM_CACHE_TTL = 3600; // 1 hour cache TTL

    constructor() {
        this.redis = new Redis(
            'redis://default:8zYjYy6ySk86q1tP6Tm826KLLqlVIP0C@redis-11035.c281.us-east-1-2.ec2.redns.redis-cloud.com:11035'
        );

        this.redis.on('connect', () => {
            console.log('Connected to Redis Cloud');
        });
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
        const sessionKey = `session:${sessionId}:problems`;
        await this.redis.set(sessionKey, JSON.stringify(problems));
        await this.redis.set(`session:${sessionId}:current_index`, '0');
    }

    async getUserProblems(sessionId: string): Promise<Problem[] | null> {
        const sessionKey = `session:${sessionId}:problems`;
        console.log("Inside redis fetch next problem", sessionKey)
        const problems = await this.redis.get(sessionKey);
        return problems ? JSON.parse(problems) : null;
    }

    async getProblemAttempts(sessionId: string, problemId: number): Promise<number> {
        const userProblemsKey = `session:${sessionId}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return 0;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        return problem?.attempts || 0;
    }

    async incrementProblemAttempt(sessionId: string, problemId: number): Promise<void> {
        const sessionProblemsKey = `session:${sessionId}:problems`;
        const problems = await this.redis.get(sessionProblemsKey);
        if (!problems) return;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);

        if (problem) {
            problem.attempts = (problem.attempts || 0) + 1;
            await this.redis.set(sessionProblemsKey, JSON.stringify(parsedProblems));
        }
    }


    async markProblemSolved(sessionid: string, problemId: number): Promise<void> {
        const userProblemsKey = `session:${sessionid}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        if (problem) {
            problem.solved = true;
            await this.redis.set(userProblemsKey, JSON.stringify(parsedProblems));
        }
    }

    async isProblemSolved(sessionId: string, problemId: number): Promise<boolean> {
        const userProblemsKey = `session:${sessionId}:problems`;
        const problems = await this.redis.get(userProblemsKey);
        if (!problems) return false;

        const parsedProblems = JSON.parse(problems);
        const problem = parsedProblems.find((p: Problem) => p.id === problemId);
        return problem?.solved || false;
    }

    async setCurrentIndex(sessionId: string, index: number): Promise<void> {
        const sessionKey = `session:${sessionId}:current_index`;
        await this.redis.set(sessionKey, index);
        console.log("Inside redis set current index", index);
    }


    async getCurrentIndex(sessionId: string): Promise<number> {
        const sessionKey = `session:${sessionId}:current_index`;
        const index = await this.redis.get(sessionKey);
        console.log("Inside redis get current index", index);
        return parseInt(index || '0');
    }

    async appendChatHistory(userId: string,
                            sessionId: string,
                            problemId: string,
                            messages: Message[]): Promise<void> {
        const sessionKey = `session:${sessionId}:${problemId}:chat_history`;
        console.log("Inside Redis poush", sessionKey);
        const sessionHistory = JSON.parse(await this.redis.get(sessionKey) || '[]');
        const updatedHistory = [...sessionHistory, ...messages];
        await this.redis.set(sessionKey, JSON.stringify(updatedHistory));
        console.log("Session History: post insert", await this.redis.get(sessionKey));
        
        const userKey = `user:${userId}:chat_history`;
        const userHistory = JSON.parse(await this.redis.get(userKey) || '[]');
        const updatedUserHistory = [...userHistory, ...messages];
        await this.redis.set(userKey, JSON.stringify(updatedUserHistory));

    }

    async getChatHistory(sessionId: string, problemId: string): Promise<Message[]> {
        const sessionKey = `session:${sessionId}:${problemId}:chat_history`;
        console.log("Session Key in get:", sessionKey);
        const history = await this.redis.get(sessionKey);
        return history ? JSON.parse(history) : [];
    }
}
