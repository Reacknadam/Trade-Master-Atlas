
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MarketDataPoint } from '../types';
import '../styles/MarketChart.css';

interface MarketChartProps {
    data: MarketDataPoint[];
    isLoading: boolean;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{`Date : ${label}`}</p>
                <p className="tooltip-price">{`Prix : ${payload[0].value.toFixed(2)} USD`}</p>
                 {payload[0].payload.rsi && <p className="tooltip-label">{`RSI : ${payload[0].payload.rsi}`}</p>}
                {payload[0].payload.sma50 && <p className="tooltip-label">{`SMA50 : ${payload[0].payload.sma50}`}</p>}
            </div>
        );
    }
    return null;
};

const MarketChart: React.FC<MarketChartProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }
    
    if (!data || data.length === 0) {
        return <div className="no-data-text">Aucune donnée à afficher.</div>
    }

    return (
        <div className="market-chart-container">
          <div className="chart-title">Graphique des Prix</div>
            <div className="chart-wrapper">
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
             <div className="chart-title">Volume</div>
            <div className="volume-wrapper">
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
