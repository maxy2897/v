import express from 'express';
import { protect, admin, finance } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import { generateWordReceipt } from '../utils/receiptGenerator.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * @desc    Get all transactions (Admin only)
 * @route   GET /api/transactions
 */
router.get('/', protect, finance, async (req, res) => {
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
 * @desc    Update transaction status and optionally delete proof image
 * @route   PATCH /api/transactions/:id
 */
router.patch('/:id', protect, admin, async (req, res) => {
    try {
        const { status, deleteImage } = req.body;
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (status) transaction.status = status;

        // Si se solicita borrar la imagen (por privacidad tras validación)
        if (deleteImage) {
            const imagePath = transaction.details?.proofImage || transaction.proof || transaction.image;
            if (imagePath) {
                const fullPath = path.join(__dirname, '../../', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                    console.log(`Eliminada imagen de comprobante: ${fullPath}`);
                }
                
                // Limpiar referencia en la base de datos
                if (transaction.details?.proofImage) {
                    transaction.details.proofImage = null;
                    transaction.markModified('details');
                }
                if (transaction.proof) transaction.proof = null;
                if (transaction.image) transaction.image = null;
            }
        }

        await transaction.save();
        res.json(transaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc    Download receipt PDF
 * @route   GET /api/transactions/:id/receipt
 */
router.get('/:id/receipt', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        const canViewAllReceipts = ['admin', 'admin_finance', 'admin_tech'].includes(req.user.role);
        const ownsReceipt = transaction.userId && transaction.userId.equals(req.user._id);
        if (!canViewAllReceipts && !ownsReceipt) {
            return res.status(403).json({ message: 'No autorizado para consultar este recibo' });
        }


        const buffer = await generateWordReceipt(transaction);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=factura-${transaction._id}.pdf`);
        res.send(buffer);
    } catch (error) {
        console.error('Receipt generation error:', error);
        res.status(500).json({ message: 'Could not generate receipt' });
    }
});

export default router;
