
import { MarketDataPoint } from '../types';

const computeRSI = (prices: number[], period = 14) => {
  if (prices.length < period) return null;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i-1];
    if (i <= period) {
       if (diff > 0) gains += diff;
       else losses -= diff;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

export const generateMarketData = (symbol: string): Promise<MarketDataPoint[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const data: MarketDataPoint[] = [];
      let price = Math.random() * 200 + 100;
      const volatility = 0.02 + Math.random() * 0.05;

      for (let i = 0; i < 180; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (180 - i));
        
        price *= 1 + (Math.random() - 0.49) * volatility;
        price = Math.max(price, 10);

        const volume = Math.floor(Math.random() * 1000000) + 500000;
        
        let sma50: number | null = null;
        if (i >= 49) {
            let sum = 0;
            for (let j = 0; j < 50; j++) {
                sum += data[i - j]?.price || price;
            }
            sma50 = sum / 50;
        }

        const pastPrices = data.slice(Math.max(0, i - 14), i + 1).map(d => d.price);
        pastPrices.push(price);
        const rsi = computeRSI(pastPrices);

        data.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(price.toFixed(2)),
          volume: volume,
          sma50: sma50 ? parseFloat(sma50.toFixed(2)) : null,
          rsi: rsi ? parseFloat(rsi.toFixed(2)) : null,
        });
      }
      resolve(data);
    }, 500);
  });
};
