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



  const calculateGainPercentage = (invested, current) => {
    if (!invested || invested === 0) return 0;
    return (((current - invested) / invested) * 100).toFixed(2);
  };

  const updateStock = (index, field, value) => {
    const updated = [...(formData.equity.directStocks || [])];
    if (!updated[index]) updated[index] = { name: '', invested: 0, current: 0 };
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
    setFormData({
      ...formData,
      equity: { ...formData.equity, directStocks: updated }
    });
  };

  const addStock = () => {
    setFormData({
      ...formData,
      equity: {
        ...formData.equity,
        directStocks: [...(formData.equity.directStocks || []), { name: '', invested: 0, current: 0 }]
      }
    });
  };

  const removeStock = (index) => {
    const newStocks = (formData.equity.directStocks || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      equity: { ...formData.equity, directStocks: newStocks }
    });
  };

  const updateMutualFund = (index, field, value) => {
    const updated = [...(formData.equity.mutualFunds || [])];
    if (!updated[index]) updated[index] = { name: '', type: '', invested: 0, current: 0 };
    if (field === 'name' || field === 'type') {
      updated[index] = { ...updated[index], name: value, type: value };
    } else {
      updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    }
    setFormData({
      ...formData,
      equity: { ...formData.equity, mutualFunds: updated }
    });
  };

  const addMutualFund = () => {
    setFormData({
      ...formData,
      equity: {
        ...formData.equity,
        mutualFunds: [...(formData.equity.mutualFunds || []), { name: '', type: '', invested: 0, current: 0 }]
      }
    });
  };

  const removeMutualFund = (index) => {
    const newMF = (formData.equity.mutualFunds || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      equity: { ...formData.equity, mutualFunds: newMF }
    });
  };

  const updateFixedIncome = (index, field, value) => {
    const updated = [...(formData.nonEquity.fixedIncomeAssets || [])];
    if (!updated[index]) updated[index] = { name: '', invested: 0, current: 0 };
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
    setFormData({
      ...formData,
      nonEquity: { ...formData.nonEquity, fixedIncomeAssets: updated }
    });
  };

  const addFixedIncome = () => {
    setFormData({
      ...formData,
      nonEquity: {
        ...formData.nonEquity,
        fixedIncomeAssets: [...(formData.nonEquity.fixedIncomeAssets || []), { name: '', invested: 0, current: 0 }]
      }
    });
  };

  const removeFixedIncome = (index) => {
    const newFixed = (formData.nonEquity.fixedIncomeAssets || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      nonEquity: { ...formData.nonEquity, fixedIncomeAssets: newFixed }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      equity: {
        ...formData.equity,
        directStocks: (formData.equity.directStocks || []).filter(
          (s) => (s.name || '').trim() !== '' && (s.invested || s.current)
        ),
        mutualFunds: (formData.equity.mutualFunds || []).filter(
          (m) => ((m.name || m.type) || '').trim() !== '' && (m.invested || m.current)
        ),
      },
      nonEquity: {
        ...formData.nonEquity,
        fixedIncomeAssets: (formData.nonEquity.fixedIncomeAssets || []).filter(
          (a) => (a.name || '').trim() !== '' && (a.invested || a.current)
        ),
      },
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Equity Section */}
      <div className="border-b border-dark/20 p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Equity</h2>
        
        {/* Direct Stocks - Tailwind table */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-dark">Direct Stocks</h3>
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
                {(formData.equity.directStocks || []).map((stock, index) => {
                  const gain = (stock.current || 0) - (stock.invested || 0);
                  const gainPct = calculateGainPercentage(stock.invested || 0, stock.current || 0);
                  return (
                    <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                      <td className="px-4 py-2 w-[30%]">
                        <input
                          type="text"
                          placeholder="Stock Name"
                          value={stock.name || ''}
                          onChange={(e) => updateStock(index, 'name', e.target.value)}
                          className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input
                          type="number"
                          placeholder="Invested"
                          value={stock.invested === 0 ? '' : stock.invested}
                          onChange={(e) => updateStock(index, 'invested', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input
                          type="number"
                          placeholder="Current"
                          value={stock.current === 0 ? '' : stock.current}
                          onChange={(e) => updateStock(index, 'current', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">
                        {gain !== 0 || (stock.invested && stock.current) ? `${gain >= 0 ? '+' : ''}${gain.toLocaleString()} (${gainPct}%)` : '—'}
                      </td>
                      <td className="px-2 py-2 w-[5%] text-center">
                        <button type="button" onClick={() => removeStock(index)} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Remove">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addStock} className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg">Add</button>
        </div>

        {/* Mutual Funds - Tailwind table */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-dark">Mutual Funds</h3>
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
                {(formData.equity.mutualFunds || []).map((mf, index) => {
                  const gain = (mf.current || 0) - (mf.invested || 0);
                  const gainPct = calculateGainPercentage(mf.invested || 0, mf.current || 0);
                  return (
                    <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                      <td className="px-4 py-2 w-[30%]">
                        <input
                          type="text"
                          placeholder="Name / Type"
                          value={mf.type || mf.name || ''}
                          onChange={(e) => updateMutualFund(index, 'type', e.target.value)}
                          className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0"
                        />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input
                          type="number"
                          placeholder="Invested"
                          value={mf.invested === 0 ? '' : mf.invested}
                          onChange={(e) => updateMutualFund(index, 'invested', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input
                          type="number"
                          placeholder="Current"
                          value={mf.current === 0 ? '' : mf.current}
                          onChange={(e) => updateMutualFund(index, 'current', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums"
                        />
                      </td>
                      <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">
                        {gain !== 0 || (mf.invested && mf.current) ? `${gain >= 0 ? '+' : ''}${gain.toLocaleString()} (${gainPct}%)` : '—'}
                      </td>
                      <td className="px-2 py-2 w-[5%] text-center">
                        <button type="button" onClick={() => removeMutualFund(index)} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Remove">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addMutualFund} className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg">Add</button>
        </div>
      </div>

      {/* Non-Equity Section - Tailwind table */}
      <div className="border-b border-dark/20 p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Non-Equity</h2>
        <div className="overflow-x-auto rounded-lg border border-dark/15 mb-4">
          <table className="w-full min-w-[400px] border-collapse text-dark text-sm">
            <thead>
              <tr className="border-b border-dark/20 bg-dark/5">
                <th className="text-left font-semibold px-4 py-3">Name</th>
                <th className="text-left font-semibold px-4 py-3 w-36">Invested</th>
                <th className="text-left font-semibold px-4 py-3 w-36">Current</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                <td className="px-4 py-2 font-medium">Cash</td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.cash.invested || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, cash: { ...formData.nonEquity.cash, invested: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.cash.current || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, cash: { ...formData.nonEquity.cash, current: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                </td>
              </tr>
              <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                <td className="px-4 py-2 font-medium">Gold</td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.commodities.gold.invested || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, commodities: { ...formData.nonEquity.commodities, gold: { ...formData.nonEquity.commodities.gold, invested: parseFloat(e.target.value) || 0 } } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.commodities.gold.current || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, commodities: { ...formData.nonEquity.commodities, gold: { ...formData.nonEquity.commodities.gold, current: parseFloat(e.target.value) || 0 } } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                </td>
              </tr>
              <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                <td className="px-4 py-2 font-medium">Silver</td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.commodities.silver.invested || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, commodities: { ...formData.nonEquity.commodities, silver: { ...formData.nonEquity.commodities.silver, invested: parseFloat(e.target.value) || 0 } } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.nonEquity.commodities.silver.current || ''} onChange={(e) => setFormData({ ...formData, nonEquity: { ...formData.nonEquity, commodities: { ...formData.nonEquity.commodities, silver: { ...formData.nonEquity.commodities.silver, current: parseFloat(e.target.value) || 0 } } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-3 text-dark">Fixed Income Assets</h3>
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
                {(formData.nonEquity.fixedIncomeAssets || []).map((asset, index) => {
                  const gain = (asset.current || 0) - (asset.invested || 0);
                  const gainPct = calculateGainPercentage(asset.invested || 0, asset.current || 0);
                  return (
                    <tr key={index} className="border-b border-dark/10 hover:bg-dark/[0.02]">
                      <td className="px-4 py-2 w-[30%]">
                        <input type="text" placeholder="Asset Name" value={asset.name || ''} onChange={(e) => updateFixedIncome(index, 'name', e.target.value)} className="w-full bg-transparent border-0 text-dark py-1.5 focus:outline-none focus:ring-0" />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input type="number" placeholder="Invested" value={asset.invested === 0 ? '' : asset.invested} onChange={(e) => updateFixedIncome(index, 'invested', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" />
                      </td>
                      <td className="px-4 py-2 w-[20%]">
                        <input type="number" placeholder="Current" value={asset.current === 0 ? '' : asset.current} onChange={(e) => updateFixedIncome(index, 'current', e.target.value)} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" />
                      </td>
                      <td className="px-4 py-2 w-[25%] text-dark text-sm whitespace-nowrap">{gain !== 0 || (asset.invested && asset.current) ? `${gain >= 0 ? '+' : ''}${gain.toLocaleString()} (${gainPct}%)` : '—'}</td>
                      <td className="px-2 py-2 w-[5%] text-center">
                        <button type="button" onClick={() => removeFixedIncome(index)} className="text-dark/70 hover:text-dark text-lg font-medium leading-none" title="Remove">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addFixedIncome} className="mt-3 bg-dark text-white px-5 py-2 font-semibold hover:opacity-80 transition-opacity text-sm rounded-lg">Add</button>
        </div>
      </div>

      {/* Emergency Section - Tailwind table */}
      <div className="border-b border-dark/20 p-6 bg-bg">
        <h2 className="text-2xl font-bold mb-4 text-dark">Emergency Fund</h2>
        <div className="overflow-x-auto rounded-lg border border-dark/15">
          <table className="w-full min-w-[400px] border-collapse text-dark text-sm">
            <thead>
              <tr className="border-b border-dark/20 bg-dark/5">
                <th className="text-left font-semibold px-4 py-3">Name</th>
                <th className="text-left font-semibold px-4 py-3 w-36">Invested</th>
                <th className="text-left font-semibold px-4 py-3 w-36">Current</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                <td className="px-4 py-2 font-medium">Invested (Emergency)</td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.emergency.invested.investedAmount || ''} onChange={(e) => setFormData({ ...formData, emergency: { ...formData.emergency, invested: { ...formData.emergency.invested, investedAmount: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.emergency.invested.currentAmount || ''} onChange={(e) => setFormData({ ...formData, emergency: { ...formData.emergency, invested: { ...formData.emergency.invested, currentAmount: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                </td>
              </tr>
              <tr className="border-b border-dark/10 hover:bg-dark/[0.02]">
                <td className="px-4 py-2 font-medium">Bank Account</td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.emergency.bankAccount.investedAmount || ''} onChange={(e) => setFormData({ ...formData, emergency: { ...formData.emergency, bankAccount: { ...formData.emergency.bankAccount, investedAmount: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Invested" />
                </td>
                <td className="px-4 py-2">
                  <input type="number" value={formData.emergency.bankAccount.currentAmount || ''} onChange={(e) => setFormData({ ...formData, emergency: { ...formData.emergency, bankAccount: { ...formData.emergency.bankAccount, currentAmount: parseFloat(e.target.value) || 0 } } })} className="w-full bg-transparent border-0 border-b border-dark/20 text-dark text-left py-1.5 focus:outline-none focus:border-dark/50 font-mono tabular-nums" placeholder="Current" />
                </td>
              </tr>
            </tbody>
          </table>
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
