import React from 'react';
import type { OutputItem, Prompt } from '../types';
import Spinner from './Spinner';

interface OutputCardProps {
    output: OutputItem;
    prompt?: Prompt;
    onRegenerate: (id: number) => void;
}

const OutputCard: React.FC<OutputCardProps> = ({ output, prompt, onRegenerate }) => {
    const promptTitle = prompt ? prompt.title : "Result";

    const handleDownload = () => {
        if (output.imageUrl) {
            const a = document.createElement('a');
            a.href = output.imageUrl;
            a.download = `drexbanana_${output.id}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const renderContent = () => {
        switch (output.status) {
            case 'pending':
                return <p className="text-sm opacity-50">Waiting in queue...</p>;
            case 'generating':
                return (
                    <div className="flex items-center gap-2">
                        <Spinner />
                        <span className="pulse">Processing...</span>
                    </div>
                );
            case 'complete':
                return <img src={output.imageUrl!} alt="Generated result" className="w-full h-full object-cover rounded-lg" />;
            case 'error':
                return (
                    <div className="p-2 text-center text-sm text-[var(--error-color)]">
                        <p><strong>Error</strong></p>
                        <p className="text-xs break-all px-2">{output.error}</p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="neo-card p-4 space-y-3 fade-in">
            <p className="font-bold text-center">{promptTitle}</p>
            <div className="aspect-square rounded-lg flex items-center justify-center bg-gray-200/50 dark:bg-gray-800/50 border-2 border-dashed border-[var(--border-color)] overflow-hidden">
                {renderContent()}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {output.status === 'complete' && (
                    <>
                        <button onClick={handleDownload} className="download-btn neo-button py-2">Download</button>
                        <button onClick={() => onRegenerate(output.id)} className="regenerate-btn neo-button py-2">Regenerate</button>
                    </>
                )}
                {output.status === 'error' && (
                    <div className="col-span-2">
                        <button onClick={() => onRegenerate(output.id)} className="regenerate-btn neo-button py-2 w-full">Try Again</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputCard;
