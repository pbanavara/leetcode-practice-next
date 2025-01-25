interface Props {
    completedProblems: number;
    totalProblems: number;
}

export const SessionProgress = ({ completedProblems, totalProblems }: Props) => {
    const progress = (completedProblems / totalProblems) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">
                    {completedProblems}/{totalProblems} Problems
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
