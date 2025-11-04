
import { GoogleGenAI } from "@google/genai";
import { MarketDataPoint, ChatMessage } from '../types';

// This is a placeholder for the API key which is expected to be in the environment variables.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("Gemini API key not found. Using mocked responses. Please set process.env.API_KEY.");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_PROMPT = `Tu es Atlas Trader, un agent IA expert en trading financier. Ton objectif principal est d'aider l'utilisateur à devenir un trader rentable en fournissant des analyses claires, des stratégies actionnables et une gestion des risques prudente.
Règles strictes:
1.  **Clarté et Actionnables**: Tes réponses doivent être directes, concises et faciles à comprendre. Évite le jargon complexe.
2.  **Basé sur les Données**: Fonde toutes tes analyses et recommandations exclusivement sur les données de marché fournies dans le contexte. N'invente jamais de données.
3.  **Gestion des Risques**: Souligne toujours l'importance de la gestion des risques. Propose des tailles de position prudentes (ex: 1-2% du capital) et suggère des stop-loss.
4.  **Explique le "Pourquoi"**: Justifie chaque analyse ou recommandation avec des indicateurs spécifiques (ex: "La tendance est haussière car le prix est au-dessus de la SMA50", "Le RSI > 70 suggère une surachat").
5.  **Ton Humain**: Adopte un ton professionnel, confiant et rassurant. Tu es un mentor, pas un robot.
6.  **Langue**: Réponds en français.`;

const formatMarketContext = (symbol: string, data: MarketDataPoint[]): string => {
    if (data.length === 0) return `Aucune donnée pour ${symbol}.`;
    const last = data[data.length - 1];
    const trend = last.price > (last.sma50 || 0) ? "Haussière" : "Baissière";

    return `
Contexte Marché pour ${symbol}:
- Données disponibles pour: ${data.length} jours.
- Dernier Prix: ${last.price.toFixed(2)} USD
- Tendance (vs SMA50): ${trend}
- RSI (14 jours): ${last.rsi?.toFixed(1) ?? 'N/A'}
- Derniers 3 jours (Prix): ${data.slice(-3).map(d => d.price.toFixed(2)).join(', ')}
`;
}

const callGemini = async (prompt: string): Promise<string> => {
    if (!ai) {
        // Mocked response for development without API key
        return new Promise(resolve => setTimeout(() => {
            if (prompt.includes("PROPOSITION DE TRADE")) {
                resolve(`**Proposition d'Achat sur BTC/USD**

*   **Raisonnement :** La tendance de fond est haussière (prix > SMA50) et le RSI (52.0) est neutre, indiquant un potentiel de hausse sans être suracheté. Le prix montre une consolidation récente, ce qui pourrait précéder un nouveau mouvement ascendant.
*   **Action :** Achat (Long)
*   **Point d'entrée :** Autour de ${Math.floor(Math.random() * 1000 + 64000)} USD
*   **Stop-Loss :** ${Math.floor(Math.random() * 1000 + 63000)} USD (Protection contre un retournement)
*   **Taille de Position :** Allouer 1% de votre capital de trading à cette position.

*Avertissement : Le trading comporte des risques. Ceci n'est pas un conseil financier.*`);
            } else if (prompt.includes("ANALYSE DE MARCHÉ")) {
                 resolve(`**Analyse de Marché - BTC/USD**

*   **Tendance Actuelle :** La tendance générale est **haussière**. Le prix se maintient au-dessus de sa moyenne mobile à 50 jours (SMA50), ce qui est un signe de force à moyen terme.
*   **Momentum (RSI) :** L'indicateur RSI est à **52.0**, ce qui indique un marché neutre. Il n'est ni en surachat (RSI > 70) ni en survente (RSI < 30), laissant de la place pour un mouvement dans les deux directions.
*   **Conclusion :** Le contexte est modérément positif. La tendance de fond soutient les positions acheteuses, mais l'absence de fort momentum suggère d'attendre une confirmation claire avant d'entrer agressivement sur le marché.`);
            } else {
                resolve("Bonjour! Je suis Atlas Trader. Comment puis-je vous aider à analyser les marchés aujourd'hui ? Demandez-moi une analyse, une proposition de trade, ou posez n'importe quelle question sur le symbole actuel.");
            }
        }, 1500));
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${SYSTEM_PROMPT}\n\n${prompt}`
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Désolé, une erreur est survenue lors de la communication avec l'IA. Veuillez réessayer.";
    }
};

export const getMarketAnalysis = (symbol: string, marketData: MarketDataPoint[]) => {
    const context = formatMarketContext(symbol, marketData);
    const prompt = `${context}\n\nREQUÊTE UTILISATEUR:\nFournis une analyse de marché détaillée et concise pour ${symbol}.`;
    return callGemini(prompt);
};

export const getTradeProposal = (symbol: string, marketData: MarketDataPoint[]) => {
    const context = formatMarketContext(symbol, marketData);
    const prompt = `${context}\n\nREQUÊTE UTILISATEUR:\nPropose un plan de trade spécifique et actionnable pour ${symbol}, incluant la direction (achat/vente), le raisonnement, un point d'entrée, un stop-loss, et une recommandation sur la taille de la position.`;
    return callGemini(prompt);
};

export const getChatResponse = (symbol: string, marketData: MarketDataPoint[], history: ChatMessage[], newUserMessage: string) => {
    const context = formatMarketContext(symbol, marketData);
    const chatHistory = history.map(msg => `${msg.sender === 'user' ? 'UTILISATEUR' : 'ATLAS'}: ${msg.text}`).join('\n');
    const prompt = `${context}\n\nHISTORIQUE DE CONVERSATION:\n${chatHistory}\n\nNOUVELLE QUESTION UTILISATEUR:\n${newUserMessage}`;
    return callGemini(prompt);
};
