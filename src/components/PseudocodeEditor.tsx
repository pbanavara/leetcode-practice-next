interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const PseudocodeEditor = ({ value, onChange }: Props) => {
    return (
        <div className="w-full text-black">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your pseudocode here..."
            />
        </div>
    );
};
