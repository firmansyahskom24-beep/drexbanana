import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center pt-8">
            <a href="https://ko-fi.com/drexproximity" target="_blank" rel="noopener noreferrer" className="neo-button inline-flex items-center gap-2 px-4 py-2 mb-4">
                <span>☕</span> Support Me
            </a>
            <p className="text-xs">Made by @drexproximity</p>
        </footer>
    );
};

export default Footer;
