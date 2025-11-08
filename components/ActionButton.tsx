import React from 'react';
import type { OutputItem } from '../types';
import Spinner from './Spinner';

interface ActionButtonProps {
    isGenerating: boolean;
    outputs: OutputItem[];
    onGenerate: () => void;
    onCancel: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ isGenerating, outputs, onGenerate, onCancel }) => {
    if (isGenerating) {
        const completed = outputs.filter(o => o.status === 'complete' || o.status === 'error').length;
        const total = outputs.length;
        return (
            <div className="neo-card p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Spinner />
                    <span>Generating... ({completed}/{total})</span>
                </div>
                <button onClick={onCancel} className="neo-button w-full text-center py-2" style={{ backgroundColor: 'var(--error-color)' }}>
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={onGenerate} className="neo-button w-full text-center py-4 text-xl" style={{ backgroundColor: 'var(--accent3-color)' }}>
                Generate
            </button>
        </div>
    );
};

export default ActionButton;
