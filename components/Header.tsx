
import React from 'react';
import { LogOut, Gem, Crown, LogIn } from 'lucide-react';
import { auth } from '../services/firebase';

interface HeaderProps {
    isLoggedIn: boolean;
    tokens: number;
    isVerifiedSeller: boolean;
    onOpenReferral: () => void;
    onOpenSubscribe: () => void;
    onLogin: () => void;
    currentSymbol: string;
    onSymbolChange: (symbol: string) => void;
    symbols: string[];
}

const Header: React.FC<HeaderProps> = ({
    isLoggedIn,
    tokens,
    isVerifiedSeller,
    onOpenReferral,
    onOpenSubscribe,
    onLogin,
    currentSymbol,
    onSymbolChange,
    symbols
}) => {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">Atlas Trader AI</h1>
                <select 
                    value={currentSymbol}
                    onChange={e => onSymbolChange(e.target.value)}
                    className="symbol-select"
                >
                    {symbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="header-right">
                {isLoggedIn ? (
                    <>
                        <button onClick={onOpenReferral} className="header-btn">
                            Parrainage
                        </button>
                        <div className="token-display">
                            <Gem size={16} color="#06b6d4" />
                            <span>{tokens}</span>
                        </div>
                        {!isVerifiedSeller && (
                            <button onClick={onOpenSubscribe} className="header-btn">
                                <Crown size={16} />
                                <span>Devenir Vendeur</span>
                            </button>
                        )}
                        <button onClick={() => auth.signOut()} className="header-btn">
                            <LogOut size={20}/>
                        </button>
                    </>
                ) : (
                    <button onClick={onLogin} className="header-btn">
                        <LogIn size={16} />
                        <span>Connexion / Inscription</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
