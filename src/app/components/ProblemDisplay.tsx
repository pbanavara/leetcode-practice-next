import React from 'react';
import { Problem } from '@/app/types';

interface Props {
    problem: Problem;
}

export const ProblemDisplay = ({ problem }: Props) => {
    if (!problem) {
        return <div>Loading...</div>;
    }
    const difficultyColor = {
        Easy: 'bg-green-100 text-green-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        Hard: 'bg-red-100 text-red-800'
    }[problem.difficulty ?? 'Easy'];

    function formatDescription(description: string) {
        return description
            .split('\n')
            .map((paragraph, index) => {
                // Handle code blocks
                if (paragraph.includes('```')) {
                    return <pre key={index} className="bg-gray-100 p-2 rounded my-2 font-mono">{paragraph.replace(/```/g, '')}</pre>;
                }

                // Handle inline code
                if (paragraph.includes('`')) {
                    const parts = paragraph.split('`');
                    return (
                        <p key={index} className="my-2">
                            {parts.map((part, i) =>
                                i % 2 === 0 ?
                                    part :
                                    <code key={i} className="bg-gray-100 px-1 rounded">{part}</code>
                            )}
                        </p>
                    );
                }

                // Regular paragraphs
                return <p key={index} className="my-2">{paragraph}</p>;
            });
    }
    return (
        <div className="bg-[#282828] rounded-lg p-6 text-[#CFD3DC]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}>
                    {problem.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}>
                    {problem.solved ? 'Solved' : 'Not Solved'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColor}`}>
                    {problem.attempts == undefined ? 'Not attempted' : `${problem.attempts} Attempts`}
                </span>
            </div>
            <div className="prose prose-invert prose-code:bg-[#1E1E1E] prose-code:text-[#CFD3DC] prose-code:px-1 prose-code:rounded max-w-none">
                {problem?.description && formatDescription(problem.description)}
            </div>
           
        </div>

    );
};
