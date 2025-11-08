import React from 'react';
import type { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
    return (
        <header className="flex justify-between items-center">
            <h1 className="text-3xl" style={{ letterSpacing: '-1.5px' }}>
                <span className="font-bold">Drex</span><span className="font-light">Banana</span> 🍌
            </h1>
            <button onClick={onToggleTheme} className="neo-button p-2 text-xl w-10 h-10 flex items-center justify-center">
                {theme === 'light' ? '🌙' : '☀️'}
            </button>
        </header>
    );
};

export default Header;
