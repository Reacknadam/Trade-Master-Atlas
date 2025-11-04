
import React from 'react';
import { GemIcon, UserGroupIcon } from './icons';

interface HeaderProps {
    tokens: number;
    onOpenReferral: () => void;
    currentSymbol: string;
    onSymbolChange: (symbol: string) => void;
    symbols: string[];
}

const Header: React.FC<HeaderProps> = ({ tokens, onOpenReferral, currentSymbol, onSymbolChange, symbols }) => {
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700 shadow-md">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl md:text-2xl font-bold text-cyan-400">
                    <span className="hidden sm:inline">Atlas Trader AI</span>
                    <span className="sm:hidden">Atlas AI</span>
                </h1>
                <select 
                  value={currentSymbol}
                  onChange={(e) => onSymbolChange(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                >
                    {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                    onClick={onOpenReferral}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
                >
                    <UserGroupIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Parrainage</span>
                </button>
                <div className="flex items-center space-x-2 bg-cyan-600/20 text-cyan-400 px-3 py-2 rounded-lg font-semibold">
                    <GemIcon className="w-5 h-5 text-cyan-500" />
                    <span>{tokens}</span>
                    <span className="hidden md:inline">Tokens</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
