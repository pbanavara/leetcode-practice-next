import { NextResponse } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';

const agent = new LeetCodeThinkingAgent();

export async function GET(
    request: Request,
    context: { params: Promise<{ sessionId: string }> }
) {
    const sessionId = (await context.params).sessionId;

    const currentProblem = await agent.getCurrentProblem(sessionId);
    console.log('Current problem:', currentProblem);
    return currentProblem ? NextResponse.json({ currentProblem }) : NextResponse.json({});
}

