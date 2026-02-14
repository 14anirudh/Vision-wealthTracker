import { useState, useEffect } from 'react';
import WealthForm from '../components/WealthForm';
import { portfolioAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    fetchPortfolio();
  }, []);
  
  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.getCurrent();
      setPortfolio(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setLoading(false);
      setShowForm(true); // Show form if no data exists
    }
  };
  
  const handleSubmit = async (formData) => {
    try {
      let response;
      if (portfolio && portfolio._id) {
        // Update existing portfolio
        response = await portfolioAPI.update(portfolio._id, formData);
      } else {
        // Create new portfolio
        response = await portfolioAPI.create(formData);
      }
      setPortfolio(response.data);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      alert('Failed to save portfolio. Please try again.');
    }
  };

  const calculateTotal = (items, field = 'current') => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item[field] || 0), 0);
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  const calculateGainPercentage = (invested, current) => {
    if (!invested || invested === 0) return 0;
    return (((current - invested) / invested) * 100).toFixed(2);
  };

  const GainBadge = ({ invested, current }) => {
    const gain = current - invested;
    const gainPct = calculateGainPercentage(invested, current);
    
    return (
      <div className="inline-block px-2 py-1 font-bold text-dark text-sm">
        {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gain >= 0 ? '+' : ''}{gainPct}%)
      </div>
    );
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-dark text-base">Loading...</div>
      </div>
    );
  }
  
  if (showForm || !portfolio) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">Wealth Portfolio Tracker</h1>
          <WealthForm onSubmit={handleSubmit} initialData={portfolio} />
        </div>
      </div>
    );
  }

  const equityTotal = portfolio.equity?.total || 0;
  const nonEquityTotal = portfolio.nonEquity?.total || 0;
  const emergencyTotal = portfolio.emergency?.total || 0;
  const grandTotal = portfolio.grandTotal || 0;
  const totalInvested = portfolio.invested || 0;

  const directStocksTotal = calculateTotal(portfolio.equity?.directStocks);
  const directStocksInvested = calculateTotal(portfolio.equity?.directStocks, 'invested');
  const mutualFundsTotal = calculateTotal(portfolio.equity?.mutualFunds);
  const mutualFundsInvested = calculateTotal(portfolio.equity?.mutualFunds, 'invested');
  
  const fixedIncomeTotal = calculateTotal(portfolio.nonEquity?.fixedIncomeAssets);
  const fixedIncomeInvested = calculateTotal(portfolio.nonEquity?.fixedIncomeAssets, 'invested');
  
  const goldCurrent = portfolio.nonEquity?.commodities?.gold?.current || 0;
  const goldInvested = portfolio.nonEquity?.commodities?.gold?.invested || 0;
  const silverCurrent = portfolio.nonEquity?.commodities?.silver?.current || 0;
  const silverInvested = portfolio.nonEquity?.commodities?.silver?.invested || 0;
  const cashCurrent = portfolio.nonEquity?.cash?.current || 0;
  const cashInvested = portfolio.nonEquity?.cash?.invested || 0;
  
  const emergencyInvestedCurrent = portfolio.emergency?.invested?.currentAmount || 0;
  const emergencyInvestedAmount = portfolio.emergency?.invested?.investedAmount || 0;
  const emergencyBankCurrent = portfolio.emergency?.bankAccount?.currentAmount || 0;
  const emergencyBankAmount = portfolio.emergency?.bankAccount?.investedAmount || 0;

  const calculatePercentage = (amount) => {
    if (!grandTotal) return '0.00';
    return ((amount / grandTotal) * 100).toFixed(2);
  };

  // Chart data for donut chart
  const chartData = [
    { name: 'Equity', value: equityTotal, color: '#3b82f6' },
    { name: 'Non-Equity', value: nonEquityTotal, color: '#10b981' },
    { name: 'Emergency', value: emergencyTotal, color: '#f59e0b' },
  ];

  const equityInvested = directStocksInvested + mutualFundsInvested;
  const nonEquityInvested = portfolio.nonEquity?.totalInvested || 0;
  const emergencyInvested = portfolio.emergency?.totalInvested || 0;

  // Overview View - Show main categories
  if (!selectedCategory) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-dark">Wealth Portfolio</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-qxl"
            >
              Edit Portfolio
            </button>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Section - Total and Categories */}
            <div className="space-y-6">
              {/* Total Value */}
              <div>
                <div className="text-dark text-base mb-2">Total Wealth</div>
                <div className="text-dark text-4xl font-bold mb-2">{formatCurrency(grandTotal)}</div>
                <div className="text-dark text-xs mb-2">Total Invested: {formatCurrency(totalInvested)}</div>
                <GainBadge invested={totalInvested} current={grandTotal} />
              </div>

              {/* Categories - Vertical Stack */}
              <div className="space-y-5">
                {/* Equity */}
                <div>
                  <div 
                    onClick={() => handleCategoryClick('equity')}
                    className="cursor-pointer hover:opacity-80 transition-all flex justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="text-dark text-xl font-bold mb-1">EQUITY</div>
                      <div className="text-dark text-3xl font-bold mb-1">{formatCurrency(equityTotal)}</div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <div className="text-dark text-xs mb-1">{calculatePercentage(equityTotal)}% of portfolio</div>
                      <GainBadge 
                        invested={equityInvested} 
                        current={equityTotal} 
                      />
                      <div className="text-dark text-xs mt-2">Click to view details →</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex justify-center">
                  <div className="w-4/5 border-t border-dark opacity-10"></div>
                </div>

                {/* Non-Equity */}
                <div>
                  <div 
                    onClick={() => handleCategoryClick('nonEquity')}
                    className="cursor-pointer hover:opacity-80 transition-all flex justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="text-dark text-xl font-bold mb-1">NON-EQUITY</div>
                      <div className="text-dark text-3xl font-bold mb-1">{formatCurrency(nonEquityTotal)}</div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <div className="text-dark text-xs mb-1">{calculatePercentage(nonEquityTotal)}% of portfolio</div>
                      <GainBadge 
                        invested={nonEquityInvested} 
                        current={nonEquityTotal} 
                      />
                      <div className="text-dark text-xs mt-2">Click to view details →</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex justify-center">
                  <div className="w-4/5 border-t border-dark opacity-10"></div>
                </div>

                {/* Emergency */}
                <div>
                  <div 
                    onClick={() => handleCategoryClick('emergency')}
                    className="cursor-pointer hover:opacity-80 transition-all flex justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="text-dark text-xl font-bold mb-1">EMERGENCY</div>
                      <div className="text-dark text-3xl font-bold mb-1">{formatCurrency(emergencyTotal)}</div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <div className="text-dark text-xs mb-1">{calculatePercentage(emergencyTotal)}% of portfolio</div>
                      <GainBadge 
                        invested={emergencyInvested} 
                        current={emergencyTotal} 
                      />
                      <div className="text-dark text-xs mt-2">Click to view details →</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Donut Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed View - Show selected category details
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 mb-5 text-dark font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </button>

        {/* Equity Details */}
        {selectedCategory === 'equity' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-dark mb-5">Equity Breakdown</h2>
            
            {/* Direct Stocks */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 p-3">
                <h3 className="text-xl font-semibold text-dark">Direct Stocks</h3>
                <div className="flex items-center gap-3">
                  <span className="text-dark font-bold text-base">{formatCurrency(directStocksTotal)}</span>
                  <GainBadge invested={directStocksInvested} current={directStocksTotal} />
                </div>
              </div>
              {portfolio.equity?.directStocks?.length > 0 ? (
                <div className="space-y-2 pl-3">
                  {portfolio.equity.directStocks.map((stock, index) => (
                    <div key={index} className="flex justify-between items-center pb-2">
                      <span className="text-dark font-bold text-base flex-1">{stock.name}</span>
                      <span className="text-dark flex-1 text-sm">{formatCurrency(stock.invested)} → {formatCurrency(stock.current)}</span>
                      <div className="flex-1 text-right">
                        <GainBadge invested={stock.invested} current={stock.current} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-dark opacity-50 pl-3 text-base">No stocks added</div>
              )}
            </div>

            {/* Mutual Funds */}
            <div>
              <div className="flex justify-between items-center mb-3 p-3">
                <h3 className="text-xl font-semibold text-dark">Mutual Funds</h3>
                <div className="flex items-center gap-3">
                  <span className="text-dark font-bold text-base">{formatCurrency(mutualFundsTotal)}</span>
                  <GainBadge invested={mutualFundsInvested} current={mutualFundsTotal} />
                </div>
              </div>
              {portfolio.equity?.mutualFunds?.length > 0 ? (
                <div className="space-y-2 pl-3">
                  {portfolio.equity.mutualFunds.map((mf, index) => (
                    <div key={index} className="flex justify-between items-center pb-2">
                      <span className="text-dark font-bold text-base flex-1">{mf.type || mf.name}</span>
                      <span className="text-dark flex-1 text-sm">{formatCurrency(mf.invested)} → {formatCurrency(mf.current)}</span>
                      <div className="flex-1 text-right">
                        <GainBadge invested={mf.invested} current={mf.current} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-dark opacity-50 pl-3 text-base">No mutual funds added</div>
              )}
            </div>
          </div>
        )}

        {/* Non-Equity Details */}
        {selectedCategory === 'nonEquity' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-dark mb-5">Non-Equity Breakdown</h2>
            
            <div className="space-y-5">
              {/* Cash */}
              <div className="flex justify-between items-center pb-3">
                <span className="text-dark text-base font-bold flex-1">Cash</span>
                <span className="text-dark flex-1 text-sm">{formatCurrency(cashInvested)} → {formatCurrency(cashCurrent)}</span>
                <div className="flex-1 text-right">
                  <GainBadge invested={cashInvested} current={cashCurrent} />
                </div>
              </div>

              {/* Gold */}
              <div className="flex justify-between items-center pb-3">
                <span className="text-dark text-base font-bold flex-1">Gold</span>
                <span className="text-dark flex-1 text-sm">{formatCurrency(goldInvested)} → {formatCurrency(goldCurrent)}</span>
                <div className="flex-1 text-right">
                  <GainBadge invested={goldInvested} current={goldCurrent} />
                </div>
              </div>

              {/* Silver */}
              <div className="flex justify-between items-center pb-3">
                <span className="text-dark text-base font-bold flex-1">Silver</span>
                <span className="text-dark flex-1 text-sm">{formatCurrency(silverInvested)} → {formatCurrency(silverCurrent)}</span>
                <div className="flex-1 text-right">
                  <GainBadge invested={silverInvested} current={silverCurrent} />
                </div>
              </div>

              {/* Fixed Income Assets */}
              <div>
                <div className="flex justify-between items-center mb-3 p-3">
                  <span className="text-dark text-xl font-semibold">Fixed Income Assets</span>
                  <div className="flex items-center gap-3">
                    <span className="text-dark font-bold text-base">{formatCurrency(fixedIncomeTotal)}</span>
                    <GainBadge invested={fixedIncomeInvested} current={fixedIncomeTotal} />
                  </div>
                </div>
                {portfolio.nonEquity?.fixedIncomeAssets?.length > 0 ? (
                  <div className="pl-3 space-y-2">
                    {portfolio.nonEquity.fixedIncomeAssets.map((asset, index) => (
                      <div key={index} className="flex justify-between items-center pb-2">
                        <span className="text-dark font-bold text-base flex-1">{asset.name}</span>
                        <span className="text-dark flex-1 text-sm">{formatCurrency(asset.invested)} → {formatCurrency(asset.current)}</span>
                        <div className="flex-1 text-right">
                          <GainBadge invested={asset.invested} current={asset.current} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-dark opacity-50 pl-3 text-base">No fixed income assets added</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Fund Details */}
        {selectedCategory === 'emergency' && (
          <div className="p-5">
            <h2 className="text-2xl font-bold text-dark mb-5">Emergency Fund Breakdown</h2>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-3">
                <span className="text-dark text-base font-bold flex-1">Invested (Emergency)</span>
                <span className="text-dark flex-1 text-sm">{formatCurrency(emergencyInvestedAmount)} → {formatCurrency(emergencyInvestedCurrent)}</span>
                <div className="flex-1 text-right">
                  <GainBadge invested={emergencyInvestedAmount} current={emergencyInvestedCurrent} />
                </div>
              </div>
              <div className="flex justify-between items-center pb-3">
                <span className="text-dark text-base font-bold flex-1">Bank Account</span>
                <span className="text-dark flex-1 text-sm">{formatCurrency(emergencyBankAmount)} → {formatCurrency(emergencyBankCurrent)}</span>
                <div className="flex-1 text-right">
                  <GainBadge invested={emergencyBankAmount} current={emergencyBankCurrent} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
