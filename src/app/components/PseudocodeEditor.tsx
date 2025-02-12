interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const PseudocodeEditor = ({ value, onChange }: Props) => {
    return (
        <div className="w-full">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-[#1E1E1E] text-[#CFD3DC] border border-[#3E3E3E] rounded-lg focus:ring-2 focus:ring-[#2CBB5D] focus:border-[#2CBB5D]"
                placeholder="Enter your pseudocode here..."
            />
        </div>

    );
};
