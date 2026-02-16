import express from 'express';
import { protect } from '../middleware/auth.js';
import Shipment from '../models/Shipment.js';

const router = express.Router();

// Generate tracking number
const generateTrackingNumber = () => {
    const prefix = 'BB';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
};

// @route   POST /api/shipments
// @desc    Create a new shipment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { origin, destination, recipient, weight, price, description } = req.body;

        // Validate required fields
        if (!origin || !destination || !recipient?.name || !weight || !price) {
            return res.status(400).json({
                message: 'Please fill all required fields'
            });
        }

        // Generate unique tracking number
        let trackingNumber;
        let isUnique = false;
        while (!isUnique) {
            trackingNumber = generateTrackingNumber();
            const existing = await Shipment.findOne({ trackingNumber });
            if (!existing) isUnique = true;
        }

        // Create shipment
        const shipment = new Shipment({
            user: req.user._id,
            trackingNumber,
            origin,
            destination,
            recipient,
            weight,
            price,
            description,
            status: 'Pendiente'
        });

        await shipment.save();

        res.status(201).json(shipment);
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Error creating shipment', error: error.message });
    }
});

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
