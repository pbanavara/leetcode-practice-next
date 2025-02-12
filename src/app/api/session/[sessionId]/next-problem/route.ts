import { NextRequest, NextResponse } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';

const agent = new LeetCodeThinkingAgent();

export async function GET(req: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
    const sessionId = (await context.params).sessionId;
   
    if (!sessionId) {
        return NextResponse.json({ error: "Session ID is missing" }, { status: 400 });
    }
    const problem = await agent.getNextProblem(sessionId);
    
    return NextResponse.json({ problem });
}
