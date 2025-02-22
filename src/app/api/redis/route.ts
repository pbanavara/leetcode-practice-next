
import { RedisManager } from '@/app/lib/services/redisManager';

const redisManager = RedisManager.getInstance();
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const isFirstTime = await redisManager.checkFirstTimeUser(token!);
    if (isFirstTime) {
        return new Response(JSON.stringify({ isFirstTime: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } else {
        return new Response(JSON.stringify({ isFirstTime: false }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
