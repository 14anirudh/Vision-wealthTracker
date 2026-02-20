import express from 'express';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

router.get('/current', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.userId }).sort({
      createdAt: -1,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'No portfolio found' });
    }

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/history', async(req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async(req, res) => {
    try {
        const data = {
            ...req.body,
            userId: req.userId,
        };
        const portfolio = new Portfolio(data);
        const savedPortfolio = await portfolio.save();
        res.status(201).json(savedPortfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async(req, res) => {
    try {
        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );

        if (!updatedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.json(updatedPortfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async(req, res) => {
    try {
        const deleted = await Portfolio.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.json({ message: 'Portfolio deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
