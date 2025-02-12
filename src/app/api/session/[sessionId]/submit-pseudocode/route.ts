import { NextRequest, NextResponse } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';

const agent = new LeetCodeThinkingAgent();

export async function POST(req: NextRequest) {
    const { pseudocode, problemId } = await req.json();
    const problem = await agent.getProblemById(Number(problemId));
    if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    const analysis = await agent.analyzePseudocode(problem, pseudocode);
    return NextResponse.json({ analysis });
}
