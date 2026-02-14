import express from 'express';
import MonthlyReturn from '../models/Returns.js';

const router = express.Router();

// Get monthly returns for a specific period
router.get('/', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const returns = await MonthlyReturn.find({ userId: 'default' })
      .sort({ year: -1, month: -1 })
      .limit(parseInt(months));
    res.json(returns.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add monthly return
router.post('/', async (req, res) => {
  try {
    const monthlyReturn = new MonthlyReturn(req.body);
    const savedReturn = await monthlyReturn.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update monthly return
router.put('/:id', async (req, res) => {
  try {
    const updatedReturn = await MonthlyReturn.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get returns summary
router.get('/summary', async (req, res) => {
  try {
    const returns = await MonthlyReturn.find({ userId: 'default' })
      .sort({ year: -1, month: -1 });
    
    const summary = {
      totalReturns: returns.reduce((sum, r) => sum + r.totalReturns, 0),
      byCategory: {
        stocks: returns.reduce((sum, r) => sum + r.returns.stocks, 0),
        mutualFunds: returns.reduce((sum, r) => sum + r.returns.mutualFunds, 0),
        commodities: returns.reduce((sum, r) => sum + r.returns.commodities, 0),
        bonds: returns.reduce((sum, r) => sum + r.returns.bonds, 0)
      },
      monthlyData: returns
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;


