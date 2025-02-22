'use client';
import ReactMarkdown from 'react-markdown';

import { useState, useEffect, useRef } from 'react';
import { ProblemDisplay } from '@/app/components/ProblemDisplay';
import { PseudocodeEditor } from '@/app/components/PseudocodeEditor';
import SessionProgress from '@/app/components/SessionProgress';
import { Problem } from '@/app/types';
import { useSession, signOut } from 'next-auth/react';
import { Message } from '@/types';
import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';

export default function MainSession() {
    const { data: authSession, status } = useSession();
    const [pseudocode, setPseudocode] = useState('');
    const NO_OF_PROBLEMS = 10;
    const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
    const [problem, setProblem] = useState<Problem>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [deckName, setDeckName] = useState('TRIAL DECK');
    const router = useRouter();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }, 100);
    };
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);

    useEffect(() => {
        if (status == "authenticated") {
            if (!authSession) {
                console.error('authSession is null');
                return;
            }
            const checkOnboarding = async () => {
                const response = await fetch('/api/redis/', {
                    headers: {
                        'Authorization': `Bearer ${authSession?.accessToken}`
                    }
                });
                const { isFirstTime } = await response.json();
                if (isFirstTime) {
                    setShowOnboardingModal(true);
                }
            };
            checkOnboarding();
            startNewSession();
        }
    }, [status, authSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [sessionProgress, setSessionProgress] = useState({ completed: 0, remaining: 0 });

    useEffect(() => {
        const fetchProgress = async () => {
            const sessionId = localStorage.getItem('leetcode_session_id');
            const response = await fetch(`/api/session/${sessionId}/sessionProgress`);
            const progress = await response.json();
            setSessionProgress(progress);
        };

        fetchProgress();
    }, [currentProblemIndex]);

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

    const handleSolvedClick = async () => {
        setIsConfirmModalOpen(true);
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
        // Fetch updated progress
        const progressResponse = await fetch(`/api/session/${sessionId}/sessionProgress`);
        const progress = await progressResponse.json();
        setSessionProgress(progress);
    };

    const handleSubmitPseudocode = async () => {
        setIsLoading(true);
        const sessionId = localStorage.getItem('leetcode_session_id');

        setMessages(prev => [...prev, {
            type: 'pseudocode',
            content: pseudocode,
            timestamp: Date.now()
        },
            {
                type: 'loading',
                content: 'Analyzing your solution...',
                timestamp: Date.now() + 1
            }
        ]);
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

            await fetch(`/api/session/${sessionId}/chat`, {
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
                            content: result.analysis,
                            
                            timestamp: Date.now() + 1
                        }
                    ],
                    sessionId: sessionId,
                    problemId: problemId,
                })
            });
            // Replace loading message with analysis
            setMessages(prev => prev.filter(m => m.type !== 'loading').concat({
                type: 'analysis',
                content: result.analysis,
                timestamp: Date.now() + 1
            }));  
            setIsLoading(false);
        }
        catch (error) {
            console.error('Error submitting pseudocode:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        
        <div className="h-screen flex flex-col bg-[#1A1A1A]">
            {/* Header with User Menu */}
            <nav className="bg-[#282828] h-12 flex items-center justify-between px-4">
                <SessionProgress
                    completedProblems={sessionProgress.completed}
                    remainingProblems={sessionProgress.remaining}
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
                                        {message.type === 'pseudocode' ? 'Your Pseudocode:' :
                                            message.type === 'loading' ? 'Loading...' : 'Analysis:'}
                                    </p>
                                    {message.type === 'loading' ? (
                                        <div className="mt-2 text-[#CFD3DC] animate-pulse">
                                            {message.content}
                                        </div>
                                    ) : message.type === 'pseudocode' ? (
                                        <pre className="mt-2 text-[#CFD3DC]">{message.content}</pre>
                                    ) : (
                                        <ReactMarkdown className="mt-2 prose prose-invert max-w-none">
                                            {message.content}
                                        </ReactMarkdown>
                                    )}
                                    </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="bg-[#1E1E1E] rounded-lg p-2">
                        <PseudocodeEditor
                            value={pseudocode}
                            onChange={setPseudocode}
                        />
                        <div className="flex gap-4 mt-4 justify-center">
                            <button
                                className="w-44 px-4 py-2 bg-[#2CBB5D] ref={messagesEndRef}text-white font-medium rounded-lg hover:bg-[#2CAA5D] transition-all"
                                onClick={handleSubmitPseudocode}
                            >
                                Submit
                            </button>
                            <button
                                className="w-44 px-4 py-2 bg-[#6B7280] text-white font-medium rounded-lg hover:bg-[#4B5563] transition-all"
                                onClick={handleSolvedClick}
                            >
                                Mark Solved
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                open={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-[#282828] rounded-lg p-6 max-w-sm">
                        <Dialog.Title className="text-lg font-medium text-white mb-4">
                            Mark Problem as Solved
                        </Dialog.Title>
                        <p className="text-[#CFD3DC] mb-6">
                            Confirm solved status, fetching next problem
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-2 bg-[#6B7280] text-white rounded-lg hover:bg-[#4B5563]"
                                onClick={() => setIsConfirmModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-[#2CBB5D] text-white rounded-lg hover:bg-[#2CAA5D]"
                                onClick={() => {
                                    handleNextProblem();
                                    setIsConfirmModalOpen(false);
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
            <Dialog
                open={showOnboardingModal}
                onClose={() => setShowOnboardingModal(false)}
                className="relative z-50"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="bg-[#282828] rounded-lg p-6 max-w-2xl w-full">
                        <Dialog.Title className="text-2xl font-bold text-white mb-4">
                            Welcome to LeetCode Thinking!
                        </Dialog.Title>
                        <div className="space-y-4 text-[#CFD3DC]">
                            <p>Here is what you can expect:</p>
                            <p>
                                Master the art of coding interviews through deliberate practice. Like in real interviews,
                                you will solve problems without a code runner, focusing on developing robust problem-solving
                                principles rather than memorizing solutions. This approach builds lasting understanding
                                and confidence in your interview skills.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>For every problem, Write your pseudocode or regular code. Preferably python</li>
                                <li>The agent gives feedback on your solution approach</li>
                                <li>Refine your pseuducode or Python code</li>
                                <li>Once the agent agrees with your solution mark the problem as solved</li>
                            </ul>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button
                                className="px-6 py-2 bg-[#2CBB5D] text-white rounded-lg hover:bg-[#2CAA5D]"
                                onClick={() => setShowOnboardingModal(false)}
                            >
                                Get Started
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>

        

    );

}
