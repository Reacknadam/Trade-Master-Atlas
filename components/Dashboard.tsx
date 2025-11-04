
import React, { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { MarketDataPoint, ChatMessage } from '../types';
import { TOKEN_COSTS, MOCKED_SYMBOLS } from '../constants';
import { useTokenManager } from '../hooks/useTokenManager';
import { generateMarketData } from '../services/marketDataService';
import { getMarketAnalysis, getTradeProposal, getChatResponse } from '../services/geminiService';
import Header from './Header';
import MarketChart from './MarketChart';
import ChatPanel from './ChatPanel';
import ReferralModal from './ReferralModal';
import SubscribeScreen from './SubscribeScreen';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [symbol, setSymbol] = useState<string>('BTC/USD');
    const [marketData, setMarketData] = useState<MarketDataPoint[]>([]);
    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
    const [isSubscribeScreenOpen, setIsSubscribeScreenOpen] = useState<boolean>(false);
    const [isVerifiedSeller, setIsVerifiedSeller] = useState<boolean>(false);

    const { tokens, spendTokens, addTokens } = useTokenManager();

    useEffect(() => {
        if (!currentUser) return;

        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setIsVerifiedSeller(doc.data().isSellerVerified === true);
            }
        });

        return () => unsubscribe();
    }, [currentUser]);

    const addMessage = (sender: 'user' | 'ai', text: string, isLoading: boolean = false) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender, text, isLoading }]);
    };
    
    const updateLastMessage = (text: string, isLoading: boolean = false) => {
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text, isLoading };
            return newMessages;
        });
    };
    
    const handleNoTokens = () => {
        addMessage('ai', "Vous n'avez pas assez de tokens pour cette action. Invitez des amis pour en gagner plus !");
    };

    const fetchMarketData = useCallback((currentSymbol: string) => {
        setIsLoadingData(true);
        generateMarketData(currentSymbol).then(data => {
            setMarketData(data);
            setIsLoadingData(false);
            setMessages([{
                id: Date.now().toString(),
                sender: 'ai',
                text: `Bonjour! Je suis Atlas, votre assistant de trading. Le marché pour ${currentSymbol} est chargé. Que souhaitez-vous faire ?`
            }]);
        });
    }, []);

    useEffect(() => {
        fetchMarketData(symbol);
    }, [symbol, fetchMarketData]);

    const handleSymbolChange = (newSymbol: string) => {
        setSymbol(newSymbol);
    };

    const handleSendMessage = async (message: string) => {
        if (isAiResponding) return;

        const hasEnoughTokens = await spendTokens(TOKEN_COSTS.GENERAL_QUERY);
        if (!hasEnoughTokens) {
            handleNoTokens();
            return;
        }

        addMessage('user', message);
        setIsAiResponding(true);
        addMessage('ai', '', true);

        const response = await getChatResponse(symbol, marketData, messages, message);
        updateLastMessage(response, false);
        setIsAiResponding(false);
    };
    
    const handleAction = async (actionType: 'analyze' | 'propose') => {
        if (isAiResponding) return;
        
        const cost = actionType === 'analyze' ? TOKEN_COSTS.MARKET_ANALYSIS : TOKEN_COSTS.TRADE_PROPOSAL;
        const actionText = actionType === 'analyze' ? `Analyse du marché pour ${symbol}` : `Proposition de trade pour ${symbol}`;

        const hasEnoughTokens = await spendTokens(cost);
        if (!hasEnoughTokens) {
            handleNoTokens();
            return;
        }

        addMessage('user', actionText);
        setIsAiResponding(true);
        addMessage('ai', '', true);

        const response = actionType === 'analyze' 
            ? await getMarketAnalysis(symbol, marketData)
            : await getTradeProposal(symbol, marketData);

        updateLastMessage(response, false);
        setIsAiResponding(false);
    };

    if (isSubscribeScreenOpen) {
        return <SubscribeScreen onClose={() => setIsSubscribeScreenOpen(false)} />;
    }

    return (
        <div className="flex flex-col h-screen">
            <Header
                tokens={tokens}
                isVerifiedSeller={isVerifiedSeller}
                onOpenReferral={() => setIsReferralModalOpen(true)}
                onOpenSubscribe={() => setIsSubscribeScreenOpen(true)}
                currentSymbol={symbol}
                onSymbolChange={handleSymbolChange}
                symbols={MOCKED_SYMBOLS}
            />
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col bg-gray-800 rounded-lg p-4">
                    <MarketChart data={marketData} isLoading={isLoadingData} />
                </div>
                <div className="lg:col-span-1 flex flex-col bg-gray-800 rounded-lg overflow-hidden">
                    <ChatPanel
                        messages={messages}
                        isAiResponding={isAiResponding}
                        onSendMessage={handleSendMessage}
                        onAction={handleAction}
                    />
                </div>
            </main>
            <ReferralModal isOpen={isReferralModalOpen} onClose={() => setIsReferralModalOpen(false)} onReferralSuccess={addTokens} />
        </div>
    );
};

export default Dashboard;
