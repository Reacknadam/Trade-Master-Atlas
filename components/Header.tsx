
import React from 'react';
import { LogOut, Gem, Crown } from 'lucide-react';
import { auth } from '../services/firebase';
import { MOCKED_SYMBOLS } from '../constants';

interface HeaderProps {
    tokens: number;
    isVerifiedSeller: boolean;
    onOpenReferral: () => void;
    onOpenSubscribe: () => void;
    currentSymbol: string;
    onSymbolChange: (symbol: string) => void;
    symbols: string[];
}

const Header: React.FC<HeaderProps> = ({
    tokens,
    isVerifiedSeller,
    onOpenReferral,
    onOpenSubscribe,
    currentSymbol,
    onSymbolChange,
    symbols
}) => {
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-cyan-400">Atlas Trader AI</h1>
                <select 
                    value={currentSymbol}
                    onChange={e => onSymbolChange(e.target.value)}
                    className="bg-gray-700 text-white rounded p-2 focus:outline-none"
                >
                    {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex items-center space-x-6">
                <button onClick={onOpenReferral} className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                    Parrainage
                </button>
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
                    <Gem className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold">{tokens}</span>
                </div>
                {!isVerifiedSeller && (
                    <button onClick={onOpenSubscribe} className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold transition-colors">
                        <Crown className="w-4 h-4" />
                        <span>Devenir Vendeur</span>
                    </button>
                )}
                <button onClick={() => auth.signOut()} className="hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5"/>
                </button>
            </div>
        </header>
    );
};

export default Header;
