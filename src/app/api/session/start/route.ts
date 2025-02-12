import { NextRequest, NextResponse } from 'next/server';
import { LeetCodeThinkingAgent } from '@/app/lib/services/leetcode';
import { format } from 'date-fns';

const agent = new LeetCodeThinkingAgent();

interface ActiveSession {
    userId: string;
    currentIndex: number;
    attempts: Record<string, number>;
}

const activeSessions: Record<string, ActiveSession> = {};

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    console.log("Authorization header:", authHeader);
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("User id:", token);
    
    const sessionId = `${token}:${format(new Date(), 'yyyyMMddHHmmss')}`;

    activeSessions[sessionId] = {
        userId: token!,
        currentIndex: 0,
        attempts: {},
    };
    // Fetch a new set of problems for the user
    
    return NextResponse.json({
        sessionId
    });
}


