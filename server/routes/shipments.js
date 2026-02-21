import express from 'express';
import { protect } from '../middleware/auth.js';
import Shipment from '../models/Shipment.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

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
            status: 'Pendiente',
            history: [{
                status: 'Pendiente',
                location: origin,
                date: new Date()
            }]
        });

        await shipment.save();

        // Create transaction record for receipt generation
        const transaction = await Transaction.create({
            type: 'SHIPMENT',
            referenceId: shipment._id,
            userId: req.user._id,
            onModel: 'Shipment',
            amount: price,
            user: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                idNumber: req.user.idNumber
            },
            details: {
                trackingNumber,
                origin,
                destination,
                description,
                weight,
                recipient
            }
        });

        // Crear notificación de confirmación
        try {
            await Notification.create({
                title: 'Envío Registrado',
                message: `Tu envío con código ${trackingNumber} ha sido registrado correctamente.`,
                type: 'success',
                userId: req.user._id,
                shipmentId: shipment._id
            });
        } catch (error) {
            console.error('Error creating registration notification:', error);
        }

        res.status(201).json({
            ...shipment.toObject(),
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ message: 'Error creating shipment', error: error.message });
    }
});

// @route   GET /api/shipments
// @desc    Get all shipments (Admin) or user's shipments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = req.user.isAdmin ? {} : { user: req.user._id };

        if (status && status !== 'all') {
            filter.status = status;
        }

        const shipments = await Shipment.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/shipments/bulk
// @desc    Create multiple shipments with consolidated invoice
// @access  Private
router.post('/bulk', protect, async (req, res) => {
    try {
        const { shipments } = req.body;

        if (!shipments || !Array.isArray(shipments) || shipments.length === 0) {
            return res.status(400).json({ message: 'Please provide shipments array' });
        }

        const createdShipments = [];
        let totalAmount = 0;

        for (const shipmentData of shipments) {
            const { origin, destination, recipient, weight, price, description } = shipmentData;

            if (!origin || !destination || !recipient?.name || !weight || !price) {
                return res.status(400).json({
                    message: 'All shipments must have required fields'
                });
            }

            let trackingNumber;
            let isUnique = false;
            while (!isUnique) {
                trackingNumber = generateTrackingNumber();
                const existing = await Shipment.findOne({ trackingNumber });
                if (!existing) isUnique = true;
            }

            const shipment = new Shipment({
                user: req.user._id,
                trackingNumber,
                origin,
                destination,
                recipient,
                weight,
                price,
                description,
                status: 'Pendiente',
                history: [{
                    status: 'Pendiente',
                    location: origin,
                    date: new Date()
                }]
            });

            await shipment.save();
            createdShipments.push(shipment);
            totalAmount += price;
        }

        const transaction = await Transaction.create({
            type: 'SHIPMENT_BULK',
            userId: req.user._id,
            amount: totalAmount,
            user: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                idNumber: req.user.idNumber
            },
            details: {
                shipments: createdShipments.map(s => ({
                    trackingNumber: s.trackingNumber,
                    origin: s.origin,
                    destination: s.destination,
                    weight: s.weight,
                    price: s.price,
                    description: s.description,
                    recipient: s.recipient
                }))
            }
        });

        // Crear notificación consolidada
        try {
            await Notification.create({
                title: 'Envíos Masivos Registrados',
                message: `Se han registrado ${createdShipments.length} envíos nuevos.`,
                type: 'success',
                userId: req.user._id
            });
        } catch (error) {
            console.error('Error creating bulk registration notification:', error);
        }

        res.status(201).json({
            shipments: createdShipments,
            transactionId: transaction._id,
            totalAmount
        });
    } catch (error) {
        console.error('Error creating bulk shipments:', error);
        res.status(500).json({ message: 'Error creating shipments', error: error.message });
    }
});

// @route   POST /api/shipments/admin/create-guest
// @desc    Create a shipment for a non-registered user (POS)
// @access  Private/Admin
router.post('/admin/create-guest', protect, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const { trackingNumber, origin, destination, weight, price, description, sender, recipient, currency } = req.body;

        if (!origin || !destination || !recipient?.name || !weight || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify tracking uniqueness if provided, if not generate
        let finalTracking = trackingNumber;
        if (!finalTracking) {
            let isUnique = false;
            while (!isUnique) {
                finalTracking = generateTrackingNumber();
                const existing = await Shipment.findOne({ trackingNumber: finalTracking });
                if (!existing) isUnique = true;
            }
        } else {
            const existing = await Shipment.findOne({ trackingNumber: finalTracking });
            if (existing) {
                return res.status(400).json({ message: 'Tracking number already exists' });
            }
        }

        const shipment = new Shipment({
            user: req.user._id, // Tied to the admin who registered it
            trackingNumber: finalTracking,
            origin,
            destination,
            recipient,
            sender, // Store sender info directly
            weight,
            price,
            description,
            status: 'Pendiente',
            history: [{
                status: 'Pendiente',
                location: origin,
                date: new Date()
            }]
        });

        await shipment.save();

        // Create transaction record
        const transaction = await Transaction.create({
            type: 'SHIPMENT',
            referenceId: shipment._id,
            userId: req.user._id,
            onModel: 'Shipment',
            amount: price,
            currency: currency || 'EUR',
            user: {
                name: sender?.name || 'Ventanilla',
                phone: sender?.phone || 'N/A',
                email: sender?.email || ''
            },
            details: {
                trackingNumber: finalTracking,
                origin,
                destination,
                description,
                weight,
                recipient,
                sender: sender // Guest sender info
            }
        });

        res.status(201).json({
            ...shipment.toObject(),
            transactionId: transaction._id
        });

    } catch (error) {
        console.error('Error in create-guest:', error);
        res.status(500).json({ message: 'Error processing guest shipment', error: error.message });
    }
});

// @route   PATCH /api/shipments/:id/status
// @desc    Update shipment status (Admin only)
// @access  Private/Admin
router.patch('/:id/status', protect, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const { status } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        shipment.status = status;

        let location = shipment.origin; // Default location logic
        if (status === 'Recogido') location = shipment.origin;
        if (status === 'En tránsito') location = 'En Ruta';
        if (status === 'En Aduanas') location = 'Aduanas';
        if (status === 'Llegado a destino') location = shipment.destination;
        if (status === 'Entregado') {
            shipment.deliveredAt = new Date();
            location = shipment.destination;
        }

        shipment.history.push({
            status,
            location,
            date: new Date()
        });

        await shipment.save();

        // Crear notificación para el usuario
        try {
            await Notification.create({
                title: 'Actualización de Envío',
                message: `Tu envío con código ${shipment.trackingNumber} ha cambiado a: ${status}`,
                type: status === 'Entregado' ? 'delivery' : 'shipment_update',
                userId: shipment.user,
                shipmentId: shipment._id
            });
        } catch (error) {
            console.error('Error creating status notification:', error);
            // No bloqueamos la respuesta principal si falla la notificación
        }

        res.json(shipment);
    } catch (error) {
        console.error('Error updating shipment status:', error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
});

// @route   GET /api/shipments/tracking/:trackingNumber
// @desc    Get full shipment info for admin (pickup)
// @access  Private/Admin
router.get('/tracking/:trackingNumber', protect, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber })
            .populate('user', 'name email phone idNumber address');

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.json(shipment);
    } catch (error) {
        console.error('Admin tracking error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/shipments/track/:trackingNumber

export default router;
