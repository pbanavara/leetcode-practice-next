'use client';
import { useRouter } from 'next/navigation';
import SignInModal from '@/app/components/auth/SigninModal';
import { useState } from 'react';
import { useSession } from 'next-auth/react';


export default function HomeHero() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleStartSession = async () => {
        if (status === 'authenticated') {
            router.push('/session');
            console.log("Session started", session);
        } else {
            setShowSignIn(true);
        }
    };
    
    const [showSignIn, setShowSignIn] = useState(false);
    return (
        <div className="text-center py-24 bg-[#1A1A1A]">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                    Master LeetCode Through AI-Powered Spaced Repetition
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                    Level up your coding interview skills with our intelligent learning system. Our AI assistant guides you through problems,
                    provides targeted feedback, and uses spaced repetition to optimize your learning curve - helping you retain solutions longer
                    and think more systematically.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-[#282828] p-8 rounded-lg hover:bg-[#2F2F2F] transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-[#2CBB5D]">Interactive AI Guidance</h2>
                        <p className="text-[#CFD3DC] leading-relaxed">
                            Get real-time hints, explanations, and feedback from your AI tutor as you solve problems
                        </p>
                    </div>

                    <div className="bg-[#282828] p-8 rounded-lg hover:bg-[#2F2F2F] transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-[#2CBB5D]">Interview Simulation</h2>
                        <p className="text-[#CFD3DC] leading-relaxed">
                            Experience realistic mock interviews with dynamic prompts and guided problem-solving
                        </p>
                    </div>

                    <div className="bg-[#282828] p-8 rounded-lg hover:bg-[#2F2F2F] transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-[#2CBB5D]">Smart Learning Path</h2>
                        <p className="text-[#CFD3DC] leading-relaxed">
                            Master complex algorithms through personalized practice sessions and targeted feedback
                        </p>
                    </div>
                </div>

                <div className="mt-16 bg-[#282828] p-12 rounded-lg">
                    <h2 className="text-3xl font-display font-bold mb-8 text-[#2CBB5D]">Transform How You Learn</h2>
                    <div className="text-left space-y-6">
                        <p className="text-xl text-[#CFD3DC] leading-relaxed">
                            Imagine having a brilliant coding mentor available 24/7, ready to guide you through challenging algorithms and data structures.
                        </p>
                        <p className="text-xl text-[#CFD3DC] leading-relaxed">
                            Our AI tutor breaks down complex concepts, provides strategic hints, and helps you build robust problem-solving skills - just like a real interviewer would.
                        </p>
                        <p className="text-xl text-[#CFD3DC] leading-relaxed">
                            Combined with spaced repetition, you will retain knowledge longer and solve problems faster. Making interview prep not just effective, but engaging.
                        </p>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => handleStartSession()}
                        className="px-10 py-5 bg-[#2CBB5D] text-white text-lg font-semibold rounded-lg hover:bg-[#2CAA5D] transition-all duration-200 flex items-center gap-2"
                    >
                        Try First Spaced Repetition Deck Free
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <SignInModal
                        isOpen={showSignIn}
                        onClose={() => setShowSignIn(false)}
                    />
                </div>
            </div>
        </div>

    );
}

