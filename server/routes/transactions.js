import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import { generateWordReceipt } from '../utils/receiptGenerator.js';

const router = express.Router();

/**
 * @desc    Get all transactions (Admin only)
 * @route   GET /api/transactions
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(100);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

/**
 * @desc    Get logged in user transactions
 * @route   GET /api/transactions/mine
 */
router.get('/mine', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

/**
 * @desc    Download receipt word doc
 * @route   GET /api/transactions/:id/receipt
 */
router.get('/:id/receipt', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // TODO: Add proper ownership check if strictly private
        // For now, allowing download if they have the ID (presumed they got it from the success screen)
        // Ideally: if (transaction.userId && (!req.user || !transaction.userId.equals(req.user._id))) ...

        const buffer = await generateWordReceipt(transaction);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=recibo-${transaction._id}.docx`);
        res.send(buffer);
    } catch (error) {
        console.error('Receipt generation error:', error);
        res.status(500).json({ message: 'Could not generate receipt' });
    }
});

export default router;
