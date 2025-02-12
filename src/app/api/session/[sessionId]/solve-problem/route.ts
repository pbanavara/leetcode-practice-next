import { NextResponse, NextRequest } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';

const agent = new LeetCodeThinkingAgent();

export async function POST(req: NextRequest) {
    const { sessionId, problemId } = await req.json();

    const authHeader = req.headers.get('authorization');
    console.log("Authorization header:", authHeader);
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = await agent.markProblemSolved(sessionId, problemId);
    return NextResponse.json({ response });
    
}