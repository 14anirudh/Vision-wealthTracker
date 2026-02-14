import express from 'express';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

// Get current portfolio
router.get('/current', async(req, res) => {
    try {
        const portfolio = await Portfolio.findOne({ userId: 'default' }).sort({ createdAt: -1 });
        if (!portfolio) {
            return res.status(404).json({ message: 'No portfolio found' });
        }
        res.json(portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all portfolios (history)
router.get('/history', async(req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: 'default' }).sort({ createdAt: -1 });
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create or update portfolio
router.post('/', async(req, res) => {
    try {
        const portfolio = new Portfolio(req.body);
        const savedPortfolio = await portfolio.save();
        res.status(201).json(savedPortfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update portfolio
router.put('/:id', async(req, res) => {
    try {
        const updatedPortfolio = await Portfolio.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true }
        );
        res.json(updatedPortfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete portfolio
router.delete('/:id', async(req, res) => {
    try {
        await Portfolio.findByIdAndDelete(req.params.id);
        res.json({ message: 'Portfolio deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;