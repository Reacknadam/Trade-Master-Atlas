
export interface MarketDataPoint {
  date: string;
  price: number;
  volume: number;
  sma50: number | null;
  rsi: number | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isLoading?: boolean;
}
