
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MarketDataPoint } from '../types';

interface MarketChartProps {
    data: MarketDataPoint[];
    isLoading: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-lg">
                <p className="label text-sm text-gray-300">{`Date : ${label}`}</p>
                <p className="intro text-cyan-400">{`Prix : ${payload[0].value.toFixed(2)} USD`}</p>
                 {payload[0].payload.rsi && <p className="text-sm text-purple-400">{`RSI : ${payload[0].payload.rsi}`}</p>}
                {payload[0].payload.sma50 && <p className="text-sm text-orange-400">{`SMA50 : ${payload[0].payload.sma50}`}</p>}
            </div>
        );
    }
    return null;
};

const MarketChart: React.FC<MarketChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }
    
    if (!data || data.length === 0) {
        return <div className="flex-1 flex items-center justify-center text-gray-500">Aucune donnée à afficher.</div>
    }

    return (
        <div className="w-full h-full flex flex-col">
          <div className="text-lg font-semibold text-gray-200 mb-4">Graphique des Prix</div>
            <div className="flex-1 w-full h-2/3">
                <ResponsiveContainer>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                        <XAxis dataKey="date" tick={{ fill: '#8A8A8A' }} stroke="#3A3A3A" />
                        <YAxis tick={{ fill: '#8A8A8A' }} stroke="#3A3A3A" domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="price" name="Prix" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#f97316" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
             <div className="text-lg font-semibold text-gray-200 my-4">Volume</div>
            <div className="flex-1 w-full h-1/3 mt-4">
                 <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2C" />
                        <XAxis dataKey="date" tick={{ fill: '#8A8A8A' }} stroke="#3A3A3A" />
                        <YAxis tick={{ fill: '#8A8A8A' }} stroke="#3A3A3A" />
                        <Tooltip wrapperStyle={{ backgroundColor: '#2C2C2C', border: '1px solid #3A3A3A', borderRadius: '8px' }} />
                        <Bar dataKey="volume" fill="#3A3A3A" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MarketChart;
