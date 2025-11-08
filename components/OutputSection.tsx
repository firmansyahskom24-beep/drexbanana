import React from 'react';
import type { OutputItem, Prompt, AppMode } from '../types';
import OutputCard from './OutputCard';

interface OutputSectionProps {
    outputs: OutputItem[];
    prompts: Prompt[];
    mode: AppMode;
    isGenerating: boolean;
    onRegenerate: (id: number) => void;
}

const OutputSection: React.FC<OutputSectionProps> = ({ outputs, prompts, mode, isGenerating, onRegenerate }) => {
    if (outputs.length === 0) {
        return null;
    }
    
    const handleDownloadAll = () => {
        outputs.forEach((output, index) => {
            if (output.status === 'complete' && output.imageUrl) {
                setTimeout(() => {
                    const a = document.createElement('a');
                    a.href = output.imageUrl!;
                    a.download = `drexbanana_${output.id}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }, index * 300);
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center pt-4">
                <h2 className="text-xl font-bold">3. Results</h2>
                {!isGenerating && outputs.some(o => o.status === 'complete') && (
                    <button onClick={handleDownloadAll} className="neo-button px-4 py-2 text-sm" style={{ backgroundColor: 'var(--accent1-color)' }}>
                        Download All
                    </button>
                )}
            </div>
            {outputs.map(output => (
                <OutputCard 
                    key={output.id} 
                    output={output} 
                    prompt={mode === 'matrix' ? prompts.find(p => p.id === output.promptId) : undefined}
                    onRegenerate={onRegenerate}
                />
            ))}
        </div>
    );
};

export default OutputSection;
