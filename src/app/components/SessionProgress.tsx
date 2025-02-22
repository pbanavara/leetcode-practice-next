interface SessionProgressProps {
    completedProblems: number;
    remainingProblems: number;
    deckName?: string;
    problemsByDifficulty: {
        Easy: number;
        Medium: number;
        Hard: number;
    };
}

export default function SessionProgress({
    completedProblems,
    remainingProblems,
    deckName = "Trial Deck",
}: SessionProgressProps) {
    const progress = (completedProblems / (completedProblems + remainingProblems)) * 100;

    return (
        <div className="flex items-center gap-6 text-[#CFD3DC]">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{deckName}</span>
                <span className="text-sm font-medium">{completedProblems}</span>
                <span className="text-sm font-medium">{remainingProblems}</span>
            </div>

            <div className="w-48">
                <div className="h-2 rounded-full bg-[#3E3E3E]">
                    <div
                        style={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-[#2CBB5D] transition-all duration-500"
                    />
                </div>
            </div>
        </div>

    );
}
