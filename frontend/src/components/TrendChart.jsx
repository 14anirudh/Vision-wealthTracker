import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  stocks: '#0ea5e9',
  mutualFunds: '#8b5cf6',
  commodities: '#f59e0b',
  bonds: '#10b981',
  total: '#ec4899',
};

const TrendChart = ({ data, type = 'line', title }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;
  
  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.stocks} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.stocks} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMutualFunds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.mutualFunds} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.mutualFunds} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCommodities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.commodities} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.commodities} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBonds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.bonds} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.bonds} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.total} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.total} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {type === 'area' ? (
            <>
              <Area
                type="monotone"
                dataKey="stocks"
                stroke={COLORS.stocks}
                fillOpacity={1}
                fill="url(#colorStocks)"
                name="Stocks"
              />
              <Area
                type="monotone"
                dataKey="mutualFunds"
                stroke={COLORS.mutualFunds}
                fillOpacity={1}
                fill="url(#colorMutualFunds)"
                name="Mutual Funds"
              />
              <Area
                type="monotone"
                dataKey="commodities"
                stroke={COLORS.commodities}
                fillOpacity={1}
                fill="url(#colorCommodities)"
                name="Commodities"
              />
              <Area
                type="monotone"
                dataKey="bonds"
                stroke={COLORS.bonds}
                fillOpacity={1}
                fill="url(#colorBonds)"
                name="Bonds"
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={3}
                fillOpacity={0}
                name="Total Returns"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="stocks"
                stroke={COLORS.stocks}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Stocks"
              />
              <Line
                type="monotone"
                dataKey="mutualFunds"
                stroke={COLORS.mutualFunds}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Mutual Funds"
              />
              <Line
                type="monotone"
                dataKey="commodities"
                stroke={COLORS.commodities}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Commodities"
              />
              <Line
                type="monotone"
                dataKey="bonds"
                stroke={COLORS.bonds}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Bonds"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.total}
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                name="Total Returns"
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;


