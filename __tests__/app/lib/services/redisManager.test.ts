import { RedisManager } from '@/app/lib/services/redisManager';
import { Problem } from '@/app/types';

describe('RedisManager', () => {
    let redisManager: RedisManager;

    beforeAll(async () => {
        redisManager = RedisManager.getInstance();
        // Wait for Redis connection
        await new Promise<void>((resolve) => {
            redisManager['redis'].on('connect', () => {
                resolve();
            });
        });
    });

    test('getUserProblems returns sorted problems by difficulty', async () => {
        // Mock data
        const mockProblems: Problem[] = [
            {
                id: 1,
                title: 'Hard Problem',
                description: 'Test hard problem description',
                difficulty: 'Easy',
                acceptance_rate: 35.5,
                frequency: 12.3,
                related_topics: ['Dynamic Programming', 'Array'],
                asked_by_faang: true,
                solved: false,
                attempts: 0
            },
            {
                id: 2,
                title: 'Easy Problem',
                description: 'Test easy problem description',
                difficulty: 'Medium',
                acceptance_rate: 75.2,
                frequency: 45.1,
                related_topics: ['Array', 'Hash Table'],
                asked_by_faang: false,
                solved: false,
                attempts: 0
            },
            {
                id: 3,
                title: 'Medium Problem',
                description: 'Test medium problem description',
                difficulty: 'Hard',
                acceptance_rate: 55.8,
                frequency: 28.4,
                related_topics: ['Binary Search', 'Tree'],
                asked_by_faang: true,
                solved: false,
                attempts: 0
            }
        ];

        // Mock the Redis get method
        jest.spyOn(redisManager['redis'], 'get').mockResolvedValue(JSON.stringify(mockProblems));

        const result = await redisManager.getUserProblems('test-session-id');

        expect(result).toBeDefined();
        expect(result![0].difficulty).toBe('Easy');
        expect(result![1].difficulty).toBe('Medium');
        expect(result![2].difficulty).toBe('Hard');
    });
});
