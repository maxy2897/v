import express from 'express';
import { protect } from '../middleware/auth.js';
import Shipment from '../models/Shipment.js';

const router = express.Router();

// @route   GET /api/shipments
// @desc    Get all shipments (Admin) or filtered
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const shipments = await Shipment.find().sort({ createdAt: -1 });
        res.json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
