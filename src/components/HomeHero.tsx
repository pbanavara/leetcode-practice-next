'use client';
import { useRouter } from 'next/navigation';
import SignInModal from '@/components/auth/SigninModal';
import { useState } from 'react';


export default function HomeHero() {
    
    const [showSignIn, setShowSignIn] = useState(false);
    return (
        <div className="text-center py-24 bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-7xl font-display font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    SpaceLeet
                </h1>
                <p className="text-3xl font-semibold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
                    Master LeetCode through intelligent tutoring and spaced repetition
                </p>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-indigo-700">Interactive AI Guidance</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Get real-time hints, explanations, and feedback from your AI tutor as you solve problems
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-indigo-700">Interview Simulation</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Experience realistic mock interviews with dynamic prompts and guided problem-solving
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                        <h2 className="font-display text-2xl font-bold mb-4 text-indigo-700">Smart Learning Path</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Master complex algorithms through personalized practice sessions and targeted feedback
                        </p>
                    </div>
                </div>

                <div className="mt-16 bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-xl">
                    <h2 className="text-3xl font-display font-bold mb-8 text-indigo-700">Transform How You Learn</h2>
                    <div className="text-left space-y-6">
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Imagine having a brilliant coding mentor available 24/7, ready to guide you through challenging algorithms and data structures.
                        </p>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Our AI tutor breaks down complex concepts, provides strategic hints, and helps you build robust problem-solving skills - just like a real interviewer would.
                        </p>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Combined with spaced repetition, you'll retain knowledge longer and solve problems faster. Making interview prep not just effective, but engaging.
                        </p>
                    </div>
                </div>
                <div className="mt-12 flex justify-center">
                <button
                    onClick={ () => setShowSignIn(true)}
                    className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-lg font-semibold rounded-full hover:scale-105 transition-transform duration-200 shadow-lg flex items-center gap-2"
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

