interface SessionProgressProps {
    completedProblems: number;
    totalProblems: number;
    deckName?: string;
    problemsByDifficulty: {
        Easy: number;
        Medium: number;
        Hard: number;
    };
}

export default function SessionProgress({
    completedProblems,
    totalProblems,
    deckName = "Trial Deck",
    problemsByDifficulty = { Easy: 0, Medium: 0, Hard: 0 }
}: SessionProgressProps) {
    const progress = (completedProblems / totalProblems) * 100;

    return (
        <div className="flex items-center gap-6 text-[#CFD3DC]">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{deckName}</span>
                <span className="text-sm font-medium">{completedProblems}/{totalProblems}</span>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#00B8A3]">{problemsByDifficulty.Easy}</span>
                    <span className="text-sm font-medium text-[#FFC01E]">{problemsByDifficulty.Medium}</span>
                    <span className="text-sm font-medium text-[#FF375F]">{problemsByDifficulty.Hard}</span>
                </div>
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
