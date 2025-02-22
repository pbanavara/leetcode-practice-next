import { Anthropic } from '@anthropic-ai/sdk';
import { Problem, Message } from '@/app/types/index';
import { RedisManager } from '@/app/lib/services/redisManager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export class LeetCodeThinkingAgent {
    private client: Anthropic;
    private redisManager: RedisManager;

    constructor() {
        this.client = new Anthropic({
            apikey: process.env.ANTHROPIC_API_KEY,
        });
        this.redisManager = RedisManager.getInstance();
    }

    async analyzePseudocode(problem: Problem, pseudocode: string): Promise<string> {
        const prompt = `
      Problem: ${problem.title}
      Description: ${problem.description}
      
      User's Pseudocode:
      ${pseudocode}
      
      Please provide your analysis of the pseudocode in markdown format.
      Do a step by step analysis of the pseudocode and prompt user to improve the pseudocode by hinting at changes.

      You should do this in a way a real interviewer would.
      Do not give out the real code or answer at any time.
      Should the user ask for the code, confirm once again and only if the user insists, provide the code.
    `;

        const response = await this.client.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        });

        return response.content[0].text;
    }

    calculateDifficulty(iterations: number): string {
        if (iterations <= 2) return "Easy";
        if (iterations <= 4) return "Medium";
        return "Hard";
    }

    async generatePythonSolution(problem: Problem): Promise<string> {
        const prompt = `
      Problem: ${problem.title}
      Description: ${problem.description}
      
      Generate a complete, efficient Python solution for this problem.
      Include:
      1. Time and space complexity analysis
      2. Clear variable names and comments
      3. Edge case handling
      4. Example test cases
    `;

        const response = await this.client.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 2000,
            temperature: 0.7,
            messages: [{ role: "user", content: prompt }]
        });

        return response.content[0].text;
    }

    async getProblemById(problemId: number): Promise<Problem | null> {
        const problem = await prisma.problems.findUnique({
            where: {
                id: problemId
            }
        });
        return problem;
    }
    
    async markProblemSolved(sessionId: string, problemId: number): Promise<void> {
        if (!sessionId || !problemId) {
            throw new Error("Invalid session or problem ID in markProblemSolved");
        }
        await this.redisManager.markProblemSolved(sessionId, problemId);
        await this.redisManager.incrementProblemAttempt(sessionId, problemId);
    }

    async getCurrentProblem(sessionId: string): Promise<Problem> {
        // First check if session has problems assigned
        console.log("Getting current problem for session:", sessionId);
        const problems = await this.redisManager.getUserProblems(sessionId);

        if (!problems) {
            // Get random problems from Postgres
            console.log("No problems found in Redis, fetching from Postgres...");
            const randomProblems = await prisma.problems.findMany({
                take: 10,
                orderBy: {
                    id: 'asc'
                }
            });

            // Store in Redis for this session
            await this.redisManager.setUserProblems(sessionId, randomProblems);
            
            // transform random problems into array of Problem objects
            const dbProblems = randomProblems.map((p: Problem )=> (
                {
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    solved: false
                }
            ))
            
            return dbProblems[0]
        }
        // get the currentt problem index from redis
        const currentProblemIndex = await this.redisManager.getCurrentIndex(sessionId) || 0;
        console.log("Current problem index:", currentProblemIndex);
        const currentProblem = problems[currentProblemIndex]
        
        //increment the current problem index in redis
        //await this.redisManager.setCurrentIndex(sessionId, currentProblemIndex + 1);
        return currentProblem
      
    }

    async getNextProblem(sessionId: string): Promise<Problem> {
        /*
        const cachedProblems = await this.redisManager.getUserProblems(sessionId);

        if (cachedProblems === null) {
            throw new Error('No problems found for the user.');
        }

        const currentProblemIndex = await this.redisManager.getCurrentIndex(sessionId);

        const nextProblemIndex = currentProblemIndex + 1;
        await this.redisManager.setCurrentIndex(sessionId, nextProblemIndex);
        return cachedProblems[nextProblemIndex];
        */
        
        /*
        const redis = new Redis(
            'redis://default:8zYjYy6ySk86q1tP6Tm826KLLqlVIP0C@redis-11035.c281.us-east-1-2.ec2.redns.redis-cloud.com:11035'
        );
        const newProblem = await getNextProblem(redis, sessionId);
        if (newProblem) {
            return newProblem;
        } else {
            throw new Error('No problems found for the user.');
        }
        */
        const newProblem = await this.redisManager.getNextProblem(sessionId);
        if (!newProblem) {
            throw new Error('No problems found for the user.');
        }
        return newProblem;

    }

    async appendChatHistory(userId: string, sessionId: string, problemId: string, messages: Message[]): Promise<void> {
        console.log("Appending chat history for session:", sessionId);
        await this.redisManager.appendChatHistory(userId, sessionId, problemId, messages);
    }

    async getChatHistory(sessionId: string, problemId: string): Promise<Message[]> {
        console.log("Fetching chat history for session:", sessionId);
        const messages = await this.redisManager.getChatHistory(sessionId, problemId);
        console.log("Fetched chat history:", messages);
        return messages;
    }
}
