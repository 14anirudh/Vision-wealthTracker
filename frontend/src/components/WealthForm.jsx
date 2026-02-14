import { useState } from 'react';

const WealthForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    equity: {
      directStocks: [],
      mutualFunds: [],
    },
    nonEquity: {
      cash: { invested: 0, current: 0 },
      commodities: {
        gold: { invested: 0, current: 0 },
        silver: { invested: 0, current: 0 }
      },
      fixedIncomeAssets: []
    },
    emergency: {
      invested: { investedAmount: 0, currentAmount: 0 },
      bankAccount: { investedAmount: 0, currentAmount: 0 }
    }
  });

  // Direct Stocks
  const [stockName, setStockName] = useState('');
  const [stockInvested, setStockInvested] = useState('');
  const [stockCurrent, setStockCurrent] = useState('');

  // Mutual Funds
  const [mfType, setMfType] = useState('');
  const [mfInvested, setMfInvested] = useState('');
  const [mfCurrent, setMfCurrent] = useState('');

  // Fixed Income
  const [fixedIncomeName, setFixedIncomeName] = useState('');
  const [fixedIncomeInvested, setFixedIncomeInvested] = useState('');
  const [fixedIncomeCurrent, setFixedIncomeCurrent] = useState('');

  const calculateGainPercentage = (invested, current) => {
    if (!invested || invested === 0) return 0;
    return (((current - invested) / invested) * 100).toFixed(2);
  };

  const addStock = () => {
    if (stockName && stockInvested && stockCurrent) {
      setFormData({
        ...formData,
        equity: {
          ...formData.equity,
          directStocks: [...formData.equity.directStocks, {
            name: stockName,
            invested: parseFloat(stockInvested),
            current: parseFloat(stockCurrent)
          }]
        }
      });
      setStockName('');
      setStockInvested('');
      setStockCurrent('');
    }
  };

  const removeStock = (index) => {
    const newStocks = formData.equity.directStocks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      equity: { ...formData.equity, directStocks: newStocks }
    });
  };

  const addMutualFund = () => {
    if (mfType && mfInvested && mfCurrent) {
      setFormData({
        ...formData,
        equity: {
          ...formData.equity,
          mutualFunds: [...formData.equity.mutualFunds, {
            name: mfType,
            type: mfType,
            invested: parseFloat(mfInvested),
            current: parseFloat(mfCurrent)
          }]
        }
      });
      setMfType('');
      setMfInvested('');
      setMfCurrent('');
    }
  };

  const removeMutualFund = (index) => {
    const newMF = formData.equity.mutualFunds.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      equity: { ...formData.equity, mutualFunds: newMF }
    });
  };

  const addFixedIncome = () => {
    if (fixedIncomeName && fixedIncomeInvested && fixedIncomeCurrent) {
      setFormData({
        ...formData,
        nonEquity: {
          ...formData.nonEquity,
          fixedIncomeAssets: [...formData.nonEquity.fixedIncomeAssets, {
            name: fixedIncomeName,
            invested: parseFloat(fixedIncomeInvested),
            current: parseFloat(fixedIncomeCurrent)
          }]
        }
      });
      setFixedIncomeName('');
      setFixedIncomeInvested('');
      setFixedIncomeCurrent('');
    }
  };

  const removeFixedIncome = (index) => {
    const newFixed = formData.nonEquity.fixedIncomeAssets.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      nonEquity: { ...formData.nonEquity, fixedIncomeAssets: newFixed }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Equity Section */}
      <div className="border-2 border-dark p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Equity</h2>
        
        {/* Direct Stocks */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-dark">Direct Stocks</h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Stock Name"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <input
              type="number"
              placeholder="Invested Amount"
              value={stockInvested}
              onChange={(e) => setStockInvested(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <input
              type="number"
              placeholder="Current Value"
              value={stockCurrent}
              onChange={(e) => setStockCurrent(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <button
              type="button"
              onClick={addStock}
              className="bg-dark text-white px-6 py-2 font-semibold hover:opacity-80 transition-opacity border-2 border-dark"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.equity.directStocks.map((stock, index) => {
              const gain = stock.current - stock.invested;
              const gainPct = calculateGainPercentage(stock.invested, stock.current);
              return (
                <div key={index} className="flex justify-between items-center bg-bg border-2 border-dark px-4 py-2">
                  <span className="text-dark font-semibold flex-1">{stock.name}</span>
                  <span className="text-dark flex-1">₹{stock.invested.toLocaleString()} → ₹{stock.current.toLocaleString()}</span>
                  <span className="flex-1 font-bold text-dark">
                    {gain >= 0 ? '+' : ''}{gain.toLocaleString()} ({gainPct}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStock(index)}
                    className="text-dark font-semibold"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mutual Funds */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-dark">Mutual Funds</h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <select
              value={mfType}
              onChange={(e) => setMfType(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            >
              <option value="">Select Type</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
              <option value="Flexi Cap">Flexi Cap</option>
              <option value="Multi Cap">Multi Cap</option>
              <option value="Index Fund">Index Fund</option>
              <option value="Debt Fund">Debt Fund</option>
            </select>
            <input
              type="number"
              placeholder="Invested Amount"
              value={mfInvested}
              onChange={(e) => setMfInvested(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <input
              type="number"
              placeholder="Current Value"
              value={mfCurrent}
              onChange={(e) => setMfCurrent(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <button
              type="button"
              onClick={addMutualFund}
              className="bg-dark text-white px-6 py-2 font-semibold hover:opacity-80 transition-opacity border-2 border-dark"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.equity.mutualFunds.map((mf, index) => {
              const gain = mf.current - mf.invested;
              const gainPct = calculateGainPercentage(mf.invested, mf.current);
              return (
                <div key={index} className="flex justify-between items-center bg-bg border-2 border-dark px-4 py-2">
                  <span className="text-dark font-semibold flex-1">{mf.type}</span>
                  <span className="text-dark flex-1">₹{mf.invested.toLocaleString()} → ₹{mf.current.toLocaleString()}</span>
                  <span className="flex-1 font-bold text-dark">
                    {gain >= 0 ? '+' : ''}{gain.toLocaleString()} ({gainPct}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeMutualFund(index)}
                    className="text-dark font-semibold"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Non-Equity Section */}
      <div className="border-2 border-dark p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Non-Equity</h2>
        
        {/* Cash */}
        <div className="mb-6">
          <label className="block text-xl font-semibold mb-2 text-dark">Cash</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-dark">Invested</label>
              <input
                type="number"
                value={formData.nonEquity.cash.invested}
                onChange={(e) => setFormData({
                  ...formData,
                  nonEquity: { 
                    ...formData.nonEquity, 
                    cash: { ...formData.nonEquity.cash, invested: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Invested amount"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-dark">Current</label>
              <input
                type="number"
                value={formData.nonEquity.cash.current}
                onChange={(e) => setFormData({
                  ...formData,
                  nonEquity: { 
                    ...formData.nonEquity, 
                    cash: { ...formData.nonEquity.cash, current: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Current value"
              />
            </div>
          </div>
        </div>

        {/* Commodities */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-dark">Commodities</h3>
          
          {/* Gold */}
          <div className="mb-4">
            <label className="block mb-2 text-dark font-semibold">Gold</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-dark">Invested</label>
                <input
                  type="number"
                  value={formData.nonEquity.commodities.gold.invested}
                  onChange={(e) => setFormData({
                    ...formData,
                    nonEquity: {
                      ...formData.nonEquity,
                      commodities: {
                        ...formData.nonEquity.commodities,
                        gold: { ...formData.nonEquity.commodities.gold, invested: parseFloat(e.target.value) || 0 }
                      }
                    }
                  })}
                  className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Invested"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-dark">Current</label>
                <input
                  type="number"
                  value={formData.nonEquity.commodities.gold.current}
                  onChange={(e) => setFormData({
                    ...formData,
                    nonEquity: {
                      ...formData.nonEquity,
                      commodities: {
                        ...formData.nonEquity.commodities,
                        gold: { ...formData.nonEquity.commodities.gold, current: parseFloat(e.target.value) || 0 }
                      }
                    }
                  })}
                  className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Current"
                />
              </div>
            </div>
          </div>

          {/* Silver */}
          <div>
            <label className="block mb-2 text-dark font-semibold">Silver</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm text-dark">Invested</label>
                <input
                  type="number"
                  value={formData.nonEquity.commodities.silver.invested}
                  onChange={(e) => setFormData({
                    ...formData,
                    nonEquity: {
                      ...formData.nonEquity,
                      commodities: {
                        ...formData.nonEquity.commodities,
                        silver: { ...formData.nonEquity.commodities.silver, invested: parseFloat(e.target.value) || 0 }
                      }
                    }
                  })}
                  className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Invested"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm text-dark">Current</label>
                <input
                  type="number"
                  value={formData.nonEquity.commodities.silver.current}
                  onChange={(e) => setFormData({
                    ...formData,
                    nonEquity: {
                      ...formData.nonEquity,
                      commodities: {
                        ...formData.nonEquity.commodities,
                        silver: { ...formData.nonEquity.commodities.silver, current: parseFloat(e.target.value) || 0 }
                      }
                    }
                  })}
                  className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="Current"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Income Assets */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-dark">Fixed Income Assets</h3>
          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              type="text"
              placeholder="Asset Name (FD, Bonds)"
              value={fixedIncomeName}
              onChange={(e) => setFixedIncomeName(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <input
              type="number"
              placeholder="Invested Amount"
              value={fixedIncomeInvested}
              onChange={(e) => setFixedIncomeInvested(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <input
              type="number"
              placeholder="Current Value"
              value={fixedIncomeCurrent}
              onChange={(e) => setFixedIncomeCurrent(e.target.value)}
              className="bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-dark"
            />
            <button
              type="button"
              onClick={addFixedIncome}
              className="bg-dark text-white px-6 py-2 font-semibold hover:opacity-80 transition-opacity border-2 border-dark"
            >
              Add
            </button>
          </div>
          <div className="space-y-2">
            {formData.nonEquity.fixedIncomeAssets.map((asset, index) => {
              const gain = asset.current - asset.invested;
              const gainPct = calculateGainPercentage(asset.invested, asset.current);
              return (
                <div key={index} className="flex justify-between items-center bg-bg border-2 border-dark px-4 py-2">
                  <span className="text-dark font-semibold flex-1">{asset.name}</span>
                  <span className="text-dark flex-1">₹{asset.invested.toLocaleString()} → ₹{asset.current.toLocaleString()}</span>
                  <span className="flex-1 font-bold text-dark">
                    {gain >= 0 ? '+' : ''}{gain.toLocaleString()} ({gainPct}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFixedIncome(index)}
                    className="text-dark font-semibold"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emergency Section */}
      <div className="border-2 border-dark p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Emergency Fund</h2>
        
        {/* Invested */}
        <div className="mb-4">
          <label className="block mb-2 text-dark text-xl font-semibold">Invested (Emergency)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-dark">Invested Amount</label>
              <input
                type="number"
                value={formData.emergency.invested.investedAmount}
                onChange={(e) => setFormData({
                  ...formData,
                  emergency: { 
                    ...formData.emergency, 
                    invested: { ...formData.emergency.invested, investedAmount: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Invested amount"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-dark">Current Value</label>
              <input
                type="number"
                value={formData.emergency.invested.currentAmount}
                onChange={(e) => setFormData({
                  ...formData,
                  emergency: { 
                    ...formData.emergency, 
                    invested: { ...formData.emergency.invested, currentAmount: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Current value"
              />
            </div>
          </div>
        </div>

        {/* Bank Account */}
        <div>
          <label className="block mb-2 text-dark text-xl font-semibold">Bank Account</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-dark">Invested Amount</label>
              <input
                type="number"
                value={formData.emergency.bankAccount.investedAmount}
                onChange={(e) => setFormData({
                  ...formData,
                  emergency: { 
                    ...formData.emergency, 
                    bankAccount: { ...formData.emergency.bankAccount, investedAmount: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Invested amount"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-dark">Current Value</label>
              <input
                type="number"
                value={formData.emergency.bankAccount.currentAmount}
                onChange={(e) => setFormData({
                  ...formData,
                  emergency: { 
                    ...formData.emergency, 
                    bankAccount: { ...formData.emergency.bankAccount, currentAmount: parseFloat(e.target.value) || 0 }
                  }
                })}
                className="w-full bg-bg border-2 border-dark text-dark px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Current value"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-dark text-white px-12 py-4 text-xl font-bold hover:opacity-80 transition-opacity border-2 border-dark"
        >
          Save Portfolio
        </button>
      </div>
    </form>
  );
};

export default WealthForm;
