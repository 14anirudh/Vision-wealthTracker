import express from 'express';
import MonthlyReturn from '../models/Returns.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const returns = await MonthlyReturn.find({ userId: req.userId })
      .sort({ year: -1, month: -1 })
      .limit(parseInt(months));
    res.json(returns.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = {
      ...req.body,
      userId: req.userId,
    };
    const monthlyReturn = new MonthlyReturn(data);
    const savedReturn = await monthlyReturn.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedReturn = await MonthlyReturn.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedReturn) {
      return res.status(404).json({ message: 'Return entry not found' });
    }

    res.json(updatedReturn);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const returns = await MonthlyReturn.find({ userId: req.userId })
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


