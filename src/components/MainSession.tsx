'use client';
import ReactMarkdown from 'react-markdown';

import { useState, useEffect, useRef } from 'react';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { PseudocodeEditor } from '@/components/PseudocodeEditor';
import { AnalysisFeedback } from '@/components/AnalysisFeedback';
import { WalkthroughInput } from '@/components/WalkthroughInput';
import { SessionProgress } from '@/components/SessionProgress';
import { api } from '@/lib/api';
import { PracticeSession } from '@/types';
import { Problem } from '@/types';
import { useSession } from 'next-auth/react';
import { Message } from '@/types';

export default function MainSession() {
    const { data: authSession, status } = useSession();
    const [session, setSession] = useState<PracticeSession | null>(null);
    const [pseudocode, setPseudocode] = useState('');
    const [walkthrough, setWalkthrough] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [verification, setVerification] = useState('');
    const [iterations, setIterations] = useState(0);
    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const NO_OF_PROBLEMS = 20;
    const [currentProblemIndex, setCurrentProblemIndex] = useState(1);
    const [remainingProblems, setRemainingProblems] = useState(NO_OF_PROBLEMS);
    const [problem, setProblem] = useState<Problem>();
    const [messages, setMessages] = useState<Message[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        if (status === 'authenticated') {
            startNewSession();
        }
    }, [status]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startNewSession = async () => {
        try {
            console.log("Starting new session...", authSession, status);
            
            const sessionData = await api.startSession(NO_OF_PROBLEMS, authSession?.accessToken || '');
            console.log("Session data received:", sessionData);
            setSession(sessionData);
            setProblem(sessionData.current_problem);
            resetState();
        } catch (error) {
        console.error('Error starting session:', error);
        }
  };
    
    const handleNextProblem = async () => {
        if (!session) return;
        try {
            const problemData = await api.getNextProblem(session.session_id, authSession?.accessToken || '');
            console.log("Problem data received:", problemData);
            setProblem(problemData.problem!);
            setCurrentProblemIndex(currentProblemIndex + 1);
            setRemainingProblems(remainingProblems - 1);
        } catch (error) {
            console.error('Error fetching next problem:', error);
        }
    };

  const resetState = () => {
    setPseudocode('');
    setWalkthrough('');
    setAnalysis('');
    setVerification('');
    setIterations(0);
    setShowWalkthrough(false);
  };

  const handleSubmitPseudocode = async () => {
      if (!session) return;
      setMessages(prev => [...prev, {
          type: 'pseudocode',
          content: pseudocode,
          timestamp: Date.now()
      }]);
      try {
        const problem_id =  session.current_problem.id;
        const result = await api.submitPseudocode(session.session_id,
            pseudocode,
            problem_id,
        authSession?.accessToken || '');
        setAnalysis(result.analysis);
        setIterations(result.iterations);
          setMessages(prev => [...prev, {
              type: 'analysis',
              content: result.analysis,
              timestamp: Date.now()
          }]);
          
      
      if (result.analysis.includes('solid') || result.analysis.includes('correct')) {
        setShowWalkthrough(true);
      }
    } catch (error) {
      console.error('Error submitting pseudocode:', error);
    }
  };


  if (!session) return <div>Loading...</div>;

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-indigo-50 via-blue-50 to-violet-50">
            <div className="h-16 px-8 py-4 max-w-xl">
                <SessionProgress
                    completedProblems={currentProblemIndex - 1}
                    totalProblems={20}
                />
            </div>

            <div className="flex flex-1 h-[calc(100vh-4rem)]">
                {/* Left Column - Problem Definition */}
                <div className="w-5/12 p-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl h-full overflow-auto">
                        <ProblemDisplay problem={problem!} />
                    </div>
                </div>

                {/* Right Column - Chat Interface */}
                <div className="w-7/12 p-6 flex flex-col">
                    {/* Chat Messages Area */}
                    <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mb-4 overflow-y-auto">
                        <div className="p-6 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={message.timestamp}
                                    className={`p-4 rounded-lg ${message.type === 'pseudocode' ? 'bg-indigo-50' : 'bg-violet-50'
                                        }`}
                                >
                                    <p className={`font-semibold ${message.type === 'pseudocode' ? 'text-indigo-700' : 'text-violet-700'
                                        }`}>
                                        {message.type === 'pseudocode' ? 'Your Pseudocode:' : 'Analysis:'}
                                    </p>
                                    {message.type === 'pseudocode' ? (
                                        <pre className="mt-2 text-gray-700">{message.content}</pre>
                                    ) : (
                                        <ReactMarkdown className="mt-2 prose prose-indigo max-w-none">
                                            {message.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    

                    {/* Input Area - Fixed at Bottom */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                        <PseudocodeEditor
                            value={pseudocode}
                            onChange={setPseudocode}
                        />
                        <div className="flex gap-4 mt-4">
                            <button
                                className="w-1/2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                                onClick={handleSubmitPseudocode}
                                disabled={showWalkthrough}
                            >
                                Submit Pseudocode
                            </button>
                            <button
                                className="w-1/2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-lg"
                                onClick={handleNextProblem}
                            >
                                Next Problem
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}
