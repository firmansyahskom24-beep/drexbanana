import React from 'react';
import type { AppMode } from '../types';

interface ModeSelectorProps {
    currentMode: AppMode;
    onModeChange: (mode: AppMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
    const getButtonClasses = (mode: AppMode) => {
        return `py-3 px-4 rounded-full text-center font-bold ${currentMode === mode ? 'text-[var(--bg-color)]' : 'text-[var(--text-color)] opacity-60'}`;
    };

    const getButtonStyle = (mode: AppMode) => {
        return { backgroundColor: currentMode === mode ? 'var(--border-color)' : 'transparent' };
    };

    return (
        <div className="neo-card p-4">
            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => onModeChange('vector')}
                    className={getButtonClasses('vector')}
                    style={getButtonStyle('vector')}
                >
                    Single Prompt
                </button>
                <button 
                    onClick={() => onModeChange('matrix')}
                    className={getButtonClasses('matrix')}
                    style={getButtonStyle('matrix')}
                >
                    Multi Prompt
                </button>
            </div>
            <p className="text-center text-sm mt-3 px-2">
                {currentMode === 'vector' 
                    ? 'Apply one prompt to all uploaded images.' 
                    : 'Apply multiple prompts to all uploaded images.'}
            </p>
        </div>
    );
};

export default ModeSelector;
