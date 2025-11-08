import React, { useState } from 'react';
import type { AppMode, Prompt } from '../types';

interface PromptInputProps {
    mode: AppMode;
    vectorPrompt: string;
    onVectorPromptChange: (value: string) => void;
    matrixPrompts: Prompt[];
    onAddMatrixPrompt: (title: string, text: string) => void;
    onRemoveMatrixPrompt: (id: number) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
    mode,
    vectorPrompt,
    onVectorPromptChange,
    matrixPrompts,
    onAddMatrixPrompt,
    onRemoveMatrixPrompt
}) => {
    const [matrixTitle, setMatrixTitle] = useState('');
    const [matrixText, setMatrixText] = useState('');

    const handleAddPrompt = () => {
        if (matrixTitle.trim() && matrixText.trim()) {
            onAddMatrixPrompt(matrixTitle.trim(), matrixText.trim());
            setMatrixTitle('');
            setMatrixText('');
        }
    };

    return (
        <div className="neo-card p-4">
            {mode === 'vector' ? (
                <div>
                    <h2 className="text-lg font-bold mb-2">2. Define Prompt</h2>
                    <textarea 
                        value={vectorPrompt}
                        onChange={(e) => onVectorPromptChange(e.target.value)}
                        className="neo-input w-full p-2 h-24 resize-none" 
                        placeholder="e.g., Make it look like a watercolor painting..."
                    />
                </div>
            ) : (
                <div>
                    <h2 className="text-lg font-bold mb-2">2. Define Prompts</h2>
                    <div className="space-y-2 mb-4">
                        {matrixPrompts.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-2 neo-input fade-in">
                                <div>
                                    <p className="font-bold">{p.title}</p>
                                    <p className="text-sm opacity-70 truncate max-w-[200px]">{p.text}</p>
                                </div>
                                <button onClick={() => onRemoveMatrixPrompt(p.id)} className="remove-prompt-btn text-lg font-bold hover:text-[var(--error-color)] transition-colors px-2">X</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={matrixTitle}
                            onChange={(e) => setMatrixTitle(e.target.value)}
                            className="neo-input w-1/3 p-2" 
                            placeholder="Title"
                        />
                        <input 
                            type="text" 
                            value={matrixText}
                            onChange={(e) => setMatrixText(e.target.value)}
                            className="neo-input w-2/3 p-2" 
                            placeholder="Prompt text..."
                        />
                    </div>
                    <button onClick={handleAddPrompt} className="neo-button w-full text-center py-2 mt-3" style={{ backgroundColor: 'var(--accent1-color)' }}>
                        Add Prompt
                    </button>
                </div>
            )}
        </div>
    );
};

export default PromptInput;
