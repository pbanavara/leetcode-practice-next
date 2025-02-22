import { RedisManager } from '@/app/lib/services/redisManager';

export async function GET(
    request: Request,
    context : { params: Promise<{ sessionId: string }> }
) {
    
    const sessionId = (await context.params).sessionId;
    
    const redisManager = RedisManager.getInstance();
    const progress = await redisManager.getSessionProgress(sessionId);
    console.log("Session progress session ", progress);
    return new Response(JSON.stringify(progress), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
