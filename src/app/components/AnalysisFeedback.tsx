interface Props {
    analysis: string;
    iterations: number;
}

export const AnalysisFeedback = ({ analysis, iterations }: Props) => {
    return (
        <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Iteration #{iterations}
                </span>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap">
                {analysis}
            </div>
        </div>
    );
};
