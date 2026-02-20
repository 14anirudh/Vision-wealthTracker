import { useState, useEffect } from 'react';
import WealthForm from '../components/WealthForm';
import { portfolioAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [noPortfolio, setNoPortfolio] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // Local edit state for breakdown views
  const [equityEdit, setEquityEdit] = useState(null);
  const [nonEquityEdit, setNonEquityEdit] = useState(null);
  const [emergencyEdit, setEmergencyEdit] = useState(null);
  // Save feedback: 'success' | 'error' | null, and message
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    fetchPortfolio();
  }, []);
  
  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.getCurrent();
      setPortfolio(response.data);
      setLoading(false);
      setNoPortfolio(false);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setLoading(false);
       if (error?.response?.status === 404) {
         setNoPortfolio(true);
       } else {
         setNoPortfolio(false);
       }
    }
  };
  
  const showSaveFeedback = (status, message) => {
    setSaveStatus(status);
    setSaveMessage(message);
    setTimeout(() => {
      setSaveStatus(null);
      setSaveMessage('');
    }, 3500);
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (portfolio && portfolio._id) {
        response = await portfolioAPI.update(portfolio._id, formData);
      } else {
        response = await portfolioAPI.create(formData);
      }
      setPortfolio(response.data);
      setShowForm(false);
      setNoPortfolio(false);
      showSaveFeedback('success', 'Portfolio saved successfully.');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      showSaveFeedback('error', 'Failed to save portfolio. Please try again.');
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
    if (category === 'equity' && portfolio?.equity) {
      setEquityEdit({
        directStocks: [...(portfolio.equity.directStocks || []).map((s) => ({ ...s }))],
        mutualFunds: [...(portfolio.equity.mutualFunds || []).map((m) => ({ ...m }))],
      });
    }
    if (category === 'nonEquity' && portfolio?.nonEquity) {
      setNonEquityEdit({
        cash: { ...(portfolio.nonEquity.cash || { invested: 0, current: 0 }) },
        commodities: {
          gold: { ...(portfolio.nonEquity.commodities?.gold || { invested: 0, current: 0 }) },
          silver: { ...(portfolio.nonEquity.commodities?.silver || { invested: 0, current: 0 }) },
        },
        fixedIncomeAssets: [...(portfolio.nonEquity.fixedIncomeAssets || []).map((a) => ({ ...a }))],
      });
    }
    if (category === 'emergency' && portfolio?.emergency) {
      setEmergencyEdit({
        invested: { ...(portfolio.emergency.invested || { investedAmount: 0, currentAmount: 0 }) },
        bankAccount: { ...(portfolio.emergency.bankAccount || { investedAmount: 0, currentAmount: 0 }) },
      });
    }
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
    setEquityEdit(null);
    setNonEquityEdit(null);
    setEmergencyEdit(null);
  };

  const updateEquityDirectStock = (index, field, value) => {
    if (!equityEdit) return;
    const updated = [...equityEdit.directStocks];
    if (!updated[index]) updated[index] = { name: '', invested: 0, current: 0 };
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
    setEquityEdit({ ...equityEdit, directStocks: updated });
  };

  const addEquityDirectStock = () => {
    if (!equityEdit) return;
    setEquityEdit({
      ...equityEdit,
      directStocks: [...equityEdit.directStocks, { name: '', invested: 0, current: 0 }],
    });
  };

  const removeEquityDirectStock = (index) => {
    if (!equityEdit) return;
    setEquityEdit({
      ...equityEdit,
      directStocks: equityEdit.directStocks.filter((_, i) => i !== index),
    });
  };

  const updateEquityMutualFund = (index, field, value) => {
    if (!equityEdit) return;
    const updated = [...equityEdit.mutualFunds];
    if (!updated[index]) updated[index] = { name: '', type: '', invested: 0, current: 0 };
    const num = parseFloat(value) || 0;
    if (field === 'name' || field === 'type') {
      updated[index] = { ...updated[index], name: value, type: value };
    } else {
      updated[index] = { ...updated[index], [field]: num };
    }
    setEquityEdit({ ...equityEdit, mutualFunds: updated });
  };

  const addEquityMutualFund = () => {
    if (!equityEdit) return;
    setEquityEdit({
      ...equityEdit,
      mutualFunds: [...equityEdit.mutualFunds, { name: '', type: '', invested: 0, current: 0 }],
    });
  };

  const removeEquityMutualFund = (index) => {
    if (!equityEdit) return;
    setEquityEdit({
      ...equityEdit,
      mutualFunds: equityEdit.mutualFunds.filter((_, i) => i !== index),
    });
  };

  const saveEquityBreakdown = async () => {
    if (!portfolio?._id || !equityEdit) return;
    const filteredStocks = equityEdit.directStocks.filter(
      (s) => (s.name || '').trim() !== '' && (s.invested || s.current)
    );
    const filteredMF = equityEdit.mutualFunds.filter(
      (m) => ((m.name || m.type) || '').trim() !== '' && (m.invested || m.current)
    );
    try {
      const payload = {
        ...portfolio,
        equity: { ...portfolio.equity, directStocks: filteredStocks, mutualFunds: filteredMF },
      };
      const response = await portfolioAPI.update(portfolio._id, payload);
      setPortfolio(response.data);
      setEquityEdit({
        directStocks: [...(response.data.equity?.directStocks || [])],
        mutualFunds: [...(response.data.equity?.mutualFunds || [])],
      });
      showSaveFeedback('success', 'Changes saved successfully.');
    } catch (err) {
      console.error('Error saving equity:', err);
      showSaveFeedback('error', 'Failed to save. Please try again.');
    }
  };

  const setNonEquityField = (path, value, isNumber = false) => {
    if (!nonEquityEdit) return;
    const v = isNumber ? (parseFloat(value) || 0) : value;
    const parts = path.split('.');
    if (parts[0] === 'cash') {
      setNonEquityEdit({ ...nonEquityEdit, cash: { ...nonEquityEdit.cash, [parts[1]]: v } });
    } else if (parts[0] === 'commodities' && parts[1]) {
      const sub = parts[1];
      setNonEquityEdit({
        ...nonEquityEdit,
        commodities: {
          ...nonEquityEdit.commodities,
          [sub]: { ...nonEquityEdit.commodities[sub], [parts[2]]: v },
        },
      });
    }
  };

  const updateNonEquityFixedIncome = (index, field, value) => {
    if (!nonEquityEdit) return;
    const updated = [...nonEquityEdit.fixedIncomeAssets];
    if (!updated[index]) updated[index] = { name: '', invested: 0, current: 0 };
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
    setNonEquityEdit({ ...nonEquityEdit, fixedIncomeAssets: updated });
  };

  const addNonEquityFixedIncome = () => {
    if (!nonEquityEdit) return;
    setNonEquityEdit({
      ...nonEquityEdit,
      fixedIncomeAssets: [...nonEquityEdit.fixedIncomeAssets, { name: '', invested: 0, current: 0 }],
    });
  };

  const removeNonEquityFixedIncome = (index) => {
    if (!nonEquityEdit) return;
    setNonEquityEdit({
      ...nonEquityEdit,
      fixedIncomeAssets: nonEquityEdit.fixedIncomeAssets.filter((_, i) => i !== index),
    });
  };

  const saveNonEquityBreakdown = async () => {
    if (!portfolio?._id || !nonEquityEdit) return;
    const filtered = (nonEquityEdit.fixedIncomeAssets || []).filter(
      (a) => (a.name || '').trim() !== '' && (a.invested || a.current)
    );
    try {
      const payload = {
        ...portfolio,
        nonEquity: {
          ...portfolio.nonEquity,
          ...nonEquityEdit,
          fixedIncomeAssets: filtered,
        },
      };
      const response = await portfolioAPI.update(portfolio._id, payload);
      setPortfolio(response.data);
      setNonEquityEdit({
        cash: { ...(response.data.nonEquity?.cash || {}) },
        commodities: { ...(response.data.nonEquity?.commodities || {}) },
        fixedIncomeAssets: [...(response.data.nonEquity?.fixedIncomeAssets || [])],
      });
      showSaveFeedback('success', 'Changes saved successfully.');
    } catch (err) {
      console.error('Error saving non-equity:', err);
      showSaveFeedback('error', 'Failed to save. Please try again.');
    }
  };

  const setEmergencyField = (section, field, value) => {
    if (!emergencyEdit) return;
    const num = parseFloat(value) || 0;
    if (section === 'invested') {
      setEmergencyEdit({ ...emergencyEdit, invested: { ...emergencyEdit.invested, [field]: num } });
    } else {
      setEmergencyEdit({ ...emergencyEdit, bankAccount: { ...emergencyEdit.bankAccount, [field]: num } });
    }
  };

  const clearNonEquityRow = (row) => {
    if (!nonEquityEdit) return;
    if (row === 'cash') {
      setNonEquityEdit({ ...nonEquityEdit, cash: { invested: 0, current: 0 } });
    } else if (row === 'gold') {
      setNonEquityEdit({
        ...nonEquityEdit,
        commodities: { ...nonEquityEdit.commodities, gold: { invested: 0, current: 0 } },
      });
    } else if (row === 'silver') {
      setNonEquityEdit({
        ...nonEquityEdit,
        commodities: { ...nonEquityEdit.commodities, silver: { invested: 0, current: 0 } },
      });
    }
  };

  const clearEmergencyRow = (row) => {
    if (!emergencyEdit) return;
    if (row === 'invested') {
      setEmergencyEdit({ ...emergencyEdit, invested: { investedAmount: 0, currentAmount: 0 } });
    } else {
      setEmergencyEdit({ ...emergencyEdit, bankAccount: { investedAmount: 0, currentAmount: 0 } });
    }
  };

  const saveEmergencyBreakdown = async () => {
    if (!portfolio?._id || !emergencyEdit) return;
    try {
      const payload = {
        ...portfolio,
        emergency: { ...portfolio.emergency, ...emergencyEdit },
      };
      const response = await portfolioAPI.update(portfolio._id, payload);
      setPortfolio(response.data);
      setEmergencyEdit({
        invested: { ...(response.data.emergency?.invested || {}) },
        bankAccount: { ...(response.data.emergency?.bankAccount || {}) },
      });
      showSaveFeedback('success', 'Changes saved successfully.');
    } catch (err) {
      console.error('Error saving emergency:', err);
      showSaveFeedback('error', 'Failed to save. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-dark text-base">Loading...</div>
      </div>
    );
  }
  
  if (showForm) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">Wealth Portfolio Tracker</h1>
          <WealthForm onSubmit={handleSubmit} initialData={portfolio} />
        </div>
      </div>
    );
  }

  if (noPortfolio || !portfolio) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-dark mb-4">Wealth Portfolio</h1>
          <p className="text-dark mb-6">
            No portfolio saved yet for this account.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-dark text-white px-6 py-3 font-semibold hover:opacity-80 transition-opacity"
          >
            Add Portfolio
          </button>
        </div>
      </div>
    );
  }

  // Compute totals from nested data so dashboard updates after in-place save (backend may not recalc on findByIdAndUpdate)
  const directStocksTotal = calculateTotal(portfolio.equity?.directStocks);
  const directStocksInvested = calculateTotal(portfolio.equity?.directStocks, 'invested');
  const mutualFundsTotal = calculateTotal(portfolio.equity?.mutualFunds);
  const mutualFundsInvested = calculateTotal(portfolio.equity?.mutualFunds, 'invested');
  const equityTotal = directStocksTotal + mutualFundsTotal;

  const fixedIncomeTotal = calculateTotal(portfolio.nonEquity?.fixedIncomeAssets);
  const fixedIncomeInvested = calculateTotal(portfolio.nonEquity?.fixedIncomeAssets, 'invested');
  const goldCurrent = portfolio.nonEquity?.commodities?.gold?.current || 0;
  const goldInvested = portfolio.nonEquity?.commodities?.gold?.invested || 0;
  const silverCurrent = portfolio.nonEquity?.commodities?.silver?.current || 0;
  const silverInvested = portfolio.nonEquity?.commodities?.silver?.invested || 0;
  const cashCurrent = portfolio.nonEquity?.cash?.current || 0;
  const cashInvested = portfolio.nonEquity?.cash?.invested || 0;
  const nonEquityTotal = cashCurrent + goldCurrent + silverCurrent + fixedIncomeTotal;
  const nonEquityInvestedTotal = cashInvested + goldInvested + silverInvested + fixedIncomeInvested;

  const emergencyInvestedCurrent = portfolio.emergency?.invested?.currentAmount || 0;
  const emergencyInvestedAmount = portfolio.emergency?.invested?.investedAmount || 0;
  const emergencyBankCurrent = portfolio.emergency?.bankAccount?.currentAmount || 0;
  const emergencyBankAmount = portfolio.emergency?.bankAccount?.investedAmount || 0;
  const emergencyTotal = emergencyInvestedCurrent + emergencyBankCurrent;
  const emergencyInvestedTotal = emergencyInvestedAmount + emergencyBankAmount;

  const grandTotal = equityTotal + nonEquityTotal + emergencyTotal;
  const totalInvested = directStocksInvested + mutualFundsInvested + nonEquityInvestedTotal + emergencyInvestedTotal;

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
  const nonEquityInvested = nonEquityInvestedTotal;
  const emergencyInvested = emergencyInvestedTotal;

  // Overview View - Show main categories
  if (!selectedCategory) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Save feedback banner */}
          {saveStatus && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                saveStatus === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
              role="alert"
            >
              {saveMessage}
            </div>
          )}

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

            {/* Right Section - Donut Chart and Edit button */}
            <div className="flex flex-col items-end">
              <button
                onClick={() => setShowForm(true)}
                className="mb-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-xl"
              >
                Edit Portfolio
              </button>
              <div className="w-full flex items-center justify-center">
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
      </div>
    );
  }

  // Detailed View - Show selected category details
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Save feedback banner */}
        {saveStatus && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
              saveStatus === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
            role="alert"
          >
            {saveMessage}
          </div>
        )}
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 mb-5 text-dark font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </button>

        {/* Equity Details - editable */}
        {selectedCategory === 'equity' && equityEdit && (
          <div className="p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-dark">Equity Breakdown</h2>
              <button
                type="button"
                onClick={saveEquityBreakdown}
                className="bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm"
              >
                Save changes
              </button>
            </div>

            {/* Direct Stocks - Tailwind table */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-dark">Direct Stocks</h3>
                <div className="flex items-center gap-3">
                  <span className="text-dark font-bold text-base">
                    {formatCurrency(
                      equityEdit.directStocks.reduce((s, i) => s + (i.current || 0), 0)
                    )}
                  </span>
                  <GainBadge
                    invested={equityEdit.directStocks.reduce((s, i) => s + (i.invested || 0), 0)}
                    current={equityEdit.directStocks.reduce((s, i) => s + (i.current || 0), 0)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-dark/15">
                <table className="w-full min-w-[500px] table-fixed border-collapse text-dark text-sm">
                  <thead>
                    <tr className="border-b border-dark/20 bg-dark/5">
                      <th className="text-left font-semibold px-4 py-3 w-[30%]">Name</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Invested Amount</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Current Value</th>
                      <th className="text-left font-semibold px-4 py-3 w-[25%]">Returns</th>
                      <th className="text-center font-semibold px-2 py-3 w-[5%]"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equityEdit.directStocks.map((stock, index) => {
                      const gain = (stock.current || 0) - (stock.invested || 0);
                      const gainPct = calculateGainPercentage(stock.invested || 0, stock.current || 0);
                      return (
                        <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                          <td className="px-4 py-2 w-[30%]">
                            <input
                              type="text"
                              placeholder="Stock Name"
                              value={stock.name || ''}
                              onChange={(e) => updateEquityDirectStock(index, 'name', e.target.value)}
                              className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0"
                            />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input
                              type="number"
                              placeholder="Invested"
                              value={stock.invested === 0 ? '' : stock.invested}
                              onChange={(e) => updateEquityDirectStock(index, 'invested', e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                            />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input
                              type="number"
                              placeholder="Current"
                              value={stock.current === 0 ? '' : stock.current}
                              onChange={(e) => updateEquityDirectStock(index, 'current', e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                            />
                          </td>
                          <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">
                            {gain !== 0 || (stock.invested && stock.current)
                              ? `${gain >= 0 ? '+' : ''}${formatCurrency(gain).replace('₹', '')} (${gainPct}%)`
                              : '—'}
                          </td>
                          <td className="px-2 py-2 w-[5%] text-center">
                            <button
                              type="button"
                              onClick={() => removeEquityDirectStock(index)}
                              className="text-dark/70 hover:text-dark text-lg font-medium leading-none"
                              title="Remove"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addEquityDirectStock}
                className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg"
              >
                Add
              </button>
            </div>

            {/* Mutual Funds - Tailwind table */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-dark">Mutual Funds</h3>
                <div className="flex items-center gap-3">
                  <span className="text-dark font-bold text-base">
                    {formatCurrency(
                      equityEdit.mutualFunds.reduce((s, i) => s + (i.current || 0), 0)
                    )}
                  </span>
                  <GainBadge
                    invested={equityEdit.mutualFunds.reduce((s, i) => s + (i.invested || 0), 0)}
                    current={equityEdit.mutualFunds.reduce((s, i) => s + (i.current || 0), 0)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto rounded-lg border border-dark/15">
                <table className="w-full min-w-[500px] table-fixed border-collapse text-dark text-sm">
                  <thead>
                    <tr className="border-b border-dark/20 bg-dark/5">
                      <th className="text-left font-semibold px-4 py-3 w-[30%]">Name</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Invested Amount</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Current Value</th>
                      <th className="text-left font-semibold px-4 py-3 w-[25%]">Returns</th>
                      <th className="text-center font-semibold px-2 py-3 w-[5%]"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equityEdit.mutualFunds.map((mf, index) => {
                      const gain = (mf.current || 0) - (mf.invested || 0);
                      const gainPct = calculateGainPercentage(mf.invested || 0, mf.current || 0);
                      return (
                        <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                          <td className="px-4 py-2 w-[30%]">
                            <input
                              type="text"
                              placeholder="Name / Type"
                              value={mf.type || mf.name || ''}
                              onChange={(e) => updateEquityMutualFund(index, 'type', e.target.value)}
                              className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0"
                            />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input
                              type="number"
                              placeholder="Invested"
                              value={mf.invested === 0 ? '' : mf.invested}
                              onChange={(e) => updateEquityMutualFund(index, 'invested', e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                            />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input
                              type="number"
                              placeholder="Current"
                              value={mf.current === 0 ? '' : mf.current}
                              onChange={(e) => updateEquityMutualFund(index, 'current', e.target.value)}
                              className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                            />
                          </td>
                          <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">
                            {gain !== 0 || (mf.invested && mf.current)
                              ? `${gain >= 0 ? '+' : ''}${formatCurrency(gain).replace('₹', '')} (${gainPct}%)`
                              : '—'}
                          </td>
                          <td className="px-2 py-2 w-[5%] text-center">
                            <button
                              type="button"
                              onClick={() => removeEquityMutualFund(index)}
                              className="text-dark/70 hover:text-dark text-lg font-medium leading-none"
                              title="Remove"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addEquityMutualFund}
                className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Non-Equity Details - editable */}
        {selectedCategory === 'nonEquity' && nonEquityEdit && (
          <div className="p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-dark">Non-Equity Breakdown</h2>
              <button type="button" onClick={saveNonEquityBreakdown} className="bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm">Save changes</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-dark/15 mb-4">
              <table className="w-full min-w-[400px] table-fixed border-collapse text-dark text-sm">
                <thead>
                  <tr className="border-b border-dark/20 bg-dark/5">
                    <th className="text-left font-semibold px-4 py-3 w-[30%]">Name</th>
                    <th className="text-left font-semibold px-4 py-3 w-[20%]">Invested</th>
                    <th className="text-left font-semibold px-4 py-3 w-[20%]">Current</th>
                    <th className="text-left font-semibold px-4 py-3 w-[25%]">Returns</th>
                    <th className="text-center font-semibold px-2 py-3 w-[5%]"> </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                    <td className="px-4 py-2 font-medium">Cash</td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.cash?.invested === 0 ? '' : nonEquityEdit.cash?.invested} onChange={(e) => setNonEquityField('cash.invested', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.cash?.current === 0 ? '' : nonEquityEdit.cash?.current} onChange={(e) => setNonEquityField('cash.current', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap"><GainBadge invested={nonEquityEdit.cash?.invested || 0} current={nonEquityEdit.cash?.current || 0} /></td>
                    <td className="px-2 py-2 w-[5%] text-center">
                      <button type="button" onClick={() => clearNonEquityRow('cash')} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Clear">×</button>
                    </td>
                  </tr>
                  <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                    <td className="px-4 py-2 font-medium">Gold</td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.commodities?.gold?.invested === 0 ? '' : nonEquityEdit.commodities?.gold?.invested} onChange={(e) => setNonEquityField('commodities.gold.invested', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.commodities?.gold?.current === 0 ? '' : nonEquityEdit.commodities?.gold?.current} onChange={(e) => setNonEquityField('commodities.gold.current', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap"><GainBadge invested={nonEquityEdit.commodities?.gold?.invested || 0} current={nonEquityEdit.commodities?.gold?.current || 0} /></td>
                    <td className="px-2 py-2 w-[5%] text-center">
                      <button type="button" onClick={() => clearNonEquityRow('gold')} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Clear">×</button>
                    </td>
                  </tr>
                  <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                    <td className="px-4 py-2 font-medium">Silver</td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.commodities?.silver?.invested === 0 ? '' : nonEquityEdit.commodities?.silver?.invested} onChange={(e) => setNonEquityField('commodities.silver.invested', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={nonEquityEdit.commodities?.silver?.current === 0 ? '' : nonEquityEdit.commodities?.silver?.current} onChange={(e) => setNonEquityField('commodities.silver.current', e.target.value, true)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap"><GainBadge invested={nonEquityEdit.commodities?.silver?.invested || 0} current={nonEquityEdit.commodities?.silver?.current || 0} /></td>
                    <td className="px-2 py-2 w-[5%] text-center">
                      <button type="button" onClick={() => clearNonEquityRow('silver')} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Clear">×</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-dark mb-3">Fixed Income Assets</h3>
              <div className="overflow-x-auto rounded-lg border border-dark/15">
                <table className="w-full min-w-[500px] table-fixed border-collapse text-dark text-sm">
                  <thead>
                    <tr className="border-b border-dark/20 bg-dark/5">
                      <th className="text-left font-semibold px-4 py-3 w-[30%]">Name</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Invested Amount</th>
                      <th className="text-left font-semibold px-4 py-3 w-[20%]">Current Value</th>
                      <th className="text-left font-semibold px-4 py-3 w-[25%]">Returns</th>
                      <th className="text-center font-semibold px-2 py-3 w-[5%]"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonEquityEdit.fixedIncomeAssets?.map((asset, index) => {
                      const gain = (asset.current || 0) - (asset.invested || 0);
                      const gainPct = calculateGainPercentage(asset.invested || 0, asset.current || 0);
                      return (
                        <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                          <td className="px-4 py-2 w-[30%]">
                            <input type="text" placeholder="Name" value={asset.name || ''} onChange={(e) => updateNonEquityFixedIncome(index, 'name', e.target.value)} className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0" />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input type="number" placeholder="Invested" value={asset.invested === 0 ? '' : asset.invested} onChange={(e) => updateNonEquityFixedIncome(index, 'invested', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" />
                          </td>
                          <td className="px-4 py-2 w-[20%]">
                            <input type="number" placeholder="Current" value={asset.current === 0 ? '' : asset.current} onChange={(e) => updateNonEquityFixedIncome(index, 'current', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" />
                          </td>
                          <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">{gain !== 0 || (asset.invested && asset.current) ? `${gain >= 0 ? '+' : ''}${formatCurrency(gain).replace('₹', '')} (${gainPct}%)` : '—'}</td>
                          <td className="px-2 py-2 w-[5%] text-center">
                            <button type="button" onClick={() => removeNonEquityFixedIncome(index)} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Remove">×</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addNonEquityFixedIncome} className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg">Add</button>
            </div>
          </div>
        )}

        {/* Emergency Fund Details - editable */}
        {selectedCategory === 'emergency' && emergencyEdit && (
          <div className="p-5">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-dark">Emergency Fund Breakdown</h2>
              <button type="button" onClick={saveEmergencyBreakdown} className="bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm">Save changes</button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-dark/15">
              <table className="w-full min-w-[400px] table-fixed border-collapse text-dark text-sm">
                <thead>
                  <tr className="border-b border-dark/20 bg-dark/5">
                    <th className="text-left font-semibold px-4 py-3 w-[30%]">Name</th>
                    <th className="text-left font-semibold px-4 py-3 w-[20%]">Invested</th>
                    <th className="text-left font-semibold px-4 py-3 w-[20%]">Current</th>
                    <th className="text-left font-semibold px-4 py-3 w-[25%]">Returns</th>
                    <th className="text-center font-semibold px-2 py-3 w-[5%]"> </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                    <td className="px-4 py-2 font-medium">Invested (Emergency)</td>
                    <td className="px-4 py-2">
                      <input type="number" value={emergencyEdit.invested?.investedAmount === 0 ? '' : emergencyEdit.invested?.investedAmount} onChange={(e) => setEmergencyField('invested', 'investedAmount', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={emergencyEdit.invested?.currentAmount === 0 ? '' : emergencyEdit.invested?.currentAmount} onChange={(e) => setEmergencyField('invested', 'currentAmount', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap"><GainBadge invested={emergencyEdit.invested?.investedAmount || 0} current={emergencyEdit.invested?.currentAmount || 0} /></td>
                    <td className="px-2 py-2 w-[5%] text-center">
                      <button type="button" onClick={() => clearEmergencyRow('invested')} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Clear">×</button>
                    </td>
                  </tr>
                  <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                    <td className="px-4 py-2 font-medium">Bank Account</td>
                    <td className="px-4 py-2">
                      <input type="number" value={emergencyEdit.bankAccount?.investedAmount === 0 ? '' : emergencyEdit.bankAccount?.investedAmount} onChange={(e) => setEmergencyField('bankAccount', 'investedAmount', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={emergencyEdit.bankAccount?.currentAmount === 0 ? '' : emergencyEdit.bankAccount?.currentAmount} onChange={(e) => setEmergencyField('bankAccount', 'currentAmount', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap"><GainBadge invested={emergencyEdit.bankAccount?.investedAmount || 0} current={emergencyEdit.bankAccount?.currentAmount || 0} /></td>
                    <td className="px-2 py-2 w-[5%] text-center">
                      <button type="button" onClick={() => clearEmergencyRow('bankAccount')} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Clear">×</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
