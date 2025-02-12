interface Props {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    verification?: string;
}

export const WalkthroughInput = ({ value, onChange, onSubmit, verification }: Props) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Solution Walkthrough</h3>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-48 p-4 font-mono text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain your solution step by step..."
            />
            <button
                onClick={onSubmit}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
                Submit Walkthrough
            </button>
            {verification && (
                <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {verification}
                </div>
            )}
        </div>
    );
};
