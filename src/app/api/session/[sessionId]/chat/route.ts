import { NextRequest, NextResponse } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';
import { Message } from '@/app/types/index';

const agent = new LeetCodeThinkingAgent();
interface ChatHistoryRequest {
    messages: Message[];
    sessionId: string;
    problemId: string;
}
export async function POST(req: NextRequest) {
    const { messages, sessionId, problemId }: ChatHistoryRequest = await req.json();
    console.log("Received messages:", messages);
    const authHeader = req.headers.get('authorization');
    console.log("Authorization header:", authHeader);
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = await agent.appendChatHistory(token, sessionId, problemId, messages);
    return NextResponse.json({ response });
    
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
    const sessionId = (await context.params).sessionId
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    if (! problemId) {
        return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }
    console.log("Received problemId inside state GET", sessionId, problemId);
    if (!sessionId) {
        return Response.json({ error: "Session ID is missing" }, { status: 400 });
    }

    const response = await agent.getChatHistory(sessionId, problemId);
    return Response.json(response  || []);
}
