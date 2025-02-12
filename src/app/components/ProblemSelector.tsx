export default function ProblemSetSelector() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-20 bg-gradient-to-b from-white to-indigo-50/30">
            <h2 className="text-3xl font-bold mb-12 text-center font-display bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Choose Your Learning Path
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
                <div className="group hover:scale-102 transition-all duration-300">
                    <div className="h-full p-8 rounded-2xl bg-white shadow-xl border border-indigo-50 hover:border-indigo-200 transition-all">
                        <h3 className="text-2xl font-display font-bold mb-4 text-indigo-700">Targeted Practice</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Focus on specific algorithms and data structures to strengthen your weak spots
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            {['Dynamic Programming', 'Graph Algorithms', 'Tree Traversal', 'System Design'].map((item) => (
                                <li key={item} className="flex items-center">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-3"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="group hover:scale-102 transition-all duration-300">
                    <div className="h-full p-8 rounded-2xl bg-white shadow-xl border border-indigo-50 hover:border-indigo-200 transition-all">
                        <h3 className="text-2xl font-display font-bold mb-4 text-indigo-700">Discovery Mode</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Let our algorithm select the perfect mix of challenges to broaden your expertise
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            {[
                                'AI-powered problem selection',
                                'Balanced difficulty progression',
                                'Comprehensive topic coverage',
                                'Adaptive learning path'
                            ].map((item) => (
                                <li key={item} className="flex items-center">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mr-3"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-display font-bold mb-8 text-indigo-700">
                    Why Choose Our Platform?
                </h3>
                <div className="space-y-4 text-lg">
                    <p className="text-gray-700 leading-relaxed">
                        Perfect for software engineers preparing for technical interviews at top tech companies
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Used by developers from Google, Amazon, Microsoft, and Meta
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Scientifically proven spaced repetition methodology
                    </p>
                </div>
            </div>
            
            <div className="mt-12 flex justify-center gap-6">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-full overflow-hidden">
                    <span className="relative z-10">Start Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-colors duration-200 border-2 border-indigo-600">
                    Explore Problem Sets
                </button>
            </div>
        </div>
    );
}

