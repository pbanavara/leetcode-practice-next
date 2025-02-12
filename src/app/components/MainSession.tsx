'use client';
import ReactMarkdown from 'react-markdown';

import { useState, useEffect, useRef } from 'react';
import { ProblemDisplay } from '@/app/components/ProblemDisplay';
import { PseudocodeEditor } from '@/app/components/PseudocodeEditor';
import SessionProgress from '@/app/components/SessionProgress';
import { api } from '@/app/lib/api';
import { PracticeSession } from '@/app/types';
import { Problem } from '@/app/types';
import { useSession, signOut } from 'next-auth/react';
import { Message } from '@/types';
import { Menu, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import next from 'next';

export default function MainSession() {
    const { data: authSession, status } = useSession();
    const [pseudocode, setPseudocode] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [iterations, setIterations] = useState(0);
    const NO_OF_PROBLEMS = 10;
    const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
    const [problem, setProblem] = useState<Problem>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [deckName, setDeckName] = useState('TRIAL DECK');
    const router = useRouter();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        if (status == "authenticated") {
            startNewSession();
        }
    }, [status]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function loadChatHistory(sessionId: string, problemId: number) {
        console.log('Loading chat history...', problemId);
        const response = await fetch(`/api/session/${sessionId}/chat?problemId=${problemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession?.accessToken}`
            }
        });
        const data = await response.json();
        console.log('Chat history loaded:', data);
        if (data !== null) {
            setMessages(data);
        } else {
            const message: Message = {
                type: 'system',
                content: 'Welcome to LeetCode Thinking!',
                timestamp: Date.now()
            };
            setMessages([message]);
        }
    };

    // Update the sign out handler
    const handleSignOut = () => {
        signOut({ redirect: false }).then(() => {
            router.push('/');
        });
    };

    const startNewSession = async () => {
        try {
            // Check for existing session
            const existingSessionId = localStorage.getItem('leetcode_session_id');
            if (existingSessionId) {
                console.log('Existing session found:', existingSessionId);
                const stateResponse = await fetch(`/api/session/${existingSessionId}/state`);
                console.log('State response: for existing session', stateResponse);
                const { currentProblem } = await stateResponse.json();
                console.log('State response: for existing session', currentProblem);
                setProblem(currentProblem);
                await loadChatHistory(existingSessionId, currentProblem.id);
                return;
            }
            // If no existing session, start a new one
            const response = await fetch('/api/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSession?.accessToken}`
                },
                body: JSON.stringify({ problemCount: NO_OF_PROBLEMS })
            });

            const { sessionId } = await response.json();
            localStorage.setItem('leetcode_session_id', sessionId);
            const stateResponse = await fetch(`/api/session/${sessionId}/state`);
            console.log('State response:', stateResponse);
            const { currentProblem } = await stateResponse.json();
            setProblem(currentProblem);

        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    const handleNextProblem = async () => {
        const sessionId = localStorage.getItem('leetcode_session_id');
        if (!sessionId) {
            console.error('No session ID found');
            return;
        }
        // mark current problem as solved
        const currentProblemId = problem?.id;
        const solveResponse = await fetch(`/api/session/${sessionId}/solve-problem/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authSession?.accessToken}`
            },
            body: JSON.stringify({
                "sessionId": sessionId,
                "problemId": currentProblemId
            })
        });
        console.log('Solve response:', solveResponse);
        // Fetch next problem
        try {
            const response = await fetch(`/api/session/${sessionId}/next-problem`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSession?.accessToken}`
                },
                
            });

            const nextProblem = await response.json();
            console.log('Next problem:', nextProblem);
            setProblem(nextProblem.problem);
            await loadChatHistory(sessionId, nextProblem.id);
        }
        catch (error) {
            console.error('Error submitting pseudocode:', error);
        }
    };

    const handleSubmitPseudocode = async () => {
        const sessionId = localStorage.getItem('leetcode_session_id');

        setMessages(prev => [...prev, {
            type: 'pseudocode',
            content: pseudocode,
            timestamp: Date.now()
        }]);
        try {
            console.log('Submitting pseudocode...');
            const problemId = problem?.id;
            
            const response = await fetch(`/api/session/${sessionId}/submit-pseudocode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSession?.accessToken}`
                },
                body: JSON.stringify({
                    pseudocode,
                    problemId: problemId,
                })
            });
            
            const result = await response.json();

            const chatResponse = await fetch(`/api/session/${sessionId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authSession?.accessToken}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            type: 'pseudocode',
                            content: pseudocode,
                            timestamp: Date.now()
                        },
                        {
                            type: 'analysis',
                            content: analysis,
                            timestamp: Date.now()
                        }
                    ],
                    sessionId: sessionId,
                    problemId: problemId,
                })
            });
            console.log('Response from chat API:', chatResponse);
            setAnalysis(result.analysis);
            setIterations(result.iterations);
            setMessages(prev => [...prev, {
                type: 'analysis',
                content: result.analysis,
                timestamp: Date.now()
            }]);
            


        }
        catch (error) {
            console.error('Error submitting pseudocode:', error);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#1A1A1A]">
            {/* Header with User Menu */}
            <nav className="bg-[#282828] h-12 flex items-center justify-between px-4">
                <SessionProgress
                    completedProblems={currentProblemIndex}
                    totalProblems={NO_OF_PROBLEMS}
                    deckName={deckName}
                    problemsByDifficulty={{
                        Easy: 5,
                        Medium: 3,
                        Hard: 2
                    }}
                />
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3E3E3E] hover:bg-[#4E4E4E] transition-all">
                        <span className="text-[#CFD3DC]">{authSession?.user?.name}</span>
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-lg bg-[#282828] shadow-lg ring-1 ring-[#3E3E3E]">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => handleSignOut()}
                                    className={`${active ? 'bg-[#3E3E3E]' : ''} group flex w-full items-center px-4 py-3 text-sm text-[#CFD3DC]`}
                                >
                                    Sign Out
                                </button>
                            )}
                        </Menu.Item>
                    </Menu.Items>
                </Menu>

            </nav>

            <div className="flex flex-1">
                {/* Left Panel - Problem */}
                <div className="w-5/12 p-4 border-r border-[#3E3E3E]">
                    <ProblemDisplay problem={problem!} />
                </div>

                {/* Right Panel - Code/Chat */}
                <div className="w-7/12 p-2 flex flex-col bg-[#282828] h-full">
                    <div className="flex-1 overflow-y-auto mb-4 max-h-[calc(100vh-400px)]">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.timestamp}
                                    className="p-4 rounded-lg bg-[#1E1E1E]"
                                >
                                    <p className="font-medium text-[#2CBB5D]">
                                        {message.type === 'pseudocode' ? 'Your Pseudocode:' : 'Analysis:'}
                                    </p>
                                    {message.type === 'pseudocode' ? (
                                        <pre className="mt-2 text-[#CFD3DC]">{message.content}</pre>
                                    ) : (
                                        <ReactMarkdown className="mt-2 prose prose-invert max-w-none">
                                            {message.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] rounded-lg p-2">
                        <PseudocodeEditor
                            value={pseudocode}
                            onChange={setPseudocode}
                        />
                        <div className="flex gap-4 mt-4 justify-center">
                            <button
                                className="w-44 px-4 py-2 bg-[#2CBB5D] text-white font-medium rounded-lg hover:bg-[#2CAA5D] transition-all"
                                onClick={handleSubmitPseudocode}
                            >
                                Submit
                            </button>
                            <button
                                className="w-44 px-4 py-2 bg-[#3E3E3E] text-[#CFD3DC] font-medium rounded-lg hover:bg-[#4E4E4E] transition-all"
                                onClick={handleNextProblem}
                            >
                                Solved, Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>


    );

}
