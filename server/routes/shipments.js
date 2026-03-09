import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import Manifest from '../models/Manifest.js';

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
// @access  Public (Optional Auth)
router.post('/', async (req, res) => {
    try {
        // Optional Auth: Try to get user if token provided
        let authUser = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                authUser = await User.findById(decoded.id).select('-password');
            } catch (err) {
                // Ignore invalid token, treat as guest
            }
        }

        const { origin, destination, recipient, sender, weight, price, description, usedDiscount, currency } = req.body;

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
            user: authUser ? authUser._id : null,
            trackingNumber,
            origin,
            destination,
            recipient,
            sender: authUser ? {
                name: authUser.name,
                phone: authUser.phone,
                idNumber: authUser.idNumber,
                email: authUser.email
            } : sender,
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

        // Check if user should be verified
        if (authUser) {
            const shipmentCount = await Shipment.countDocuments({ user: authUser._id });
            if (shipmentCount >= 3) {
                await User.findByIdAndUpdate(authUser._id, { isVerified: true });
            }

            if (usedDiscount) {
                await User.findByIdAndUpdate(authUser._id, { discountEligible: false });
            }
        }

        // Create transaction record for receipt generation
        const transaction = await Transaction.create({
            type: 'SHIPMENT',
            referenceId: shipment._id,
            userId: authUser ? authUser._id : null,
            onModel: 'Shipment',
            amount: price,
            currency: currency || 'EUR',
            user: authUser ? {
                name: authUser.name,
                email: authUser.email,
                phone: authUser.phone,
                idNumber: authUser.idNumber
            } : {
                name: sender?.name || recipient.name,
                phone: sender?.phone || recipient.phone,
                idNumber: sender?.idNumber || ''
            },
            details: {
                trackingNumber,
                origin,
                destination,
                description,
                weight,
                recipient,
                sender: authUser ? null : sender
            }
        });

        // Crear notificación de confirmación (solo si hay usuario)
        if (authUser) {
            try {
                await Notification.create({
                    title: 'Envío Registrado',
                    message: `Tu envío con código ${trackingNumber} ha sido registrado correctamente.`,
                    type: 'success',
                    userId: authUser._id,
                    shipmentId: shipment._id
                });
            } catch (error) {
                console.error('Error creating registration notification:', error);
            }
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
// @access  Public (Optional Auth)
router.post('/bulk', async (req, res) => {
    try {
        // Optional Auth
        let authUser = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                authUser = await User.findById(decoded.id).select('-password');
            } catch (err) { }
        }

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
                user: authUser ? authUser._id : null,
                trackingNumber,
                origin,
                destination,
                recipient,
                sender: authUser ? {
                    name: authUser.name,
                    phone: authUser.phone,
                    idNumber: authUser.idNumber
                } : shipmentData.sender,
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

        // Check if user should be verified (after creating all bulk shipments)
        if (authUser) {
            const shipmentCount = await Shipment.countDocuments({ user: authUser._id });
            if (shipmentCount >= 3) {
                await User.findByIdAndUpdate(authUser._id, { isVerified: true });
            }

            if (shipments.some(s => s.usedDiscount)) {
                await User.findByIdAndUpdate(authUser._id, { discountEligible: false });
            }
        }

        const transaction = await Transaction.create({
            type: 'SHIPMENT_BULK',
            userId: authUser ? authUser._id : null,
            amount: totalAmount,
            user: authUser ? {
                name: authUser.name,
                email: authUser.email,
                phone: authUser.phone,
                idNumber: authUser.idNumber
            } : {
                name: shipments[0]?.sender?.name || shipments[0]?.recipient?.name,
                phone: shipments[0]?.sender?.phone || shipments[0]?.recipient?.phone,
                idNumber: shipments[0]?.sender?.idNumber || ''
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
        if (authUser) {
            try {
                await Notification.create({
                    title: 'Envíos Masivos Registrados',
                    message: `Se han registrado ${createdShipments.length} envíos nuevos.`,
                    type: 'success',
                    userId: authUser._id
                });
            } catch (error) {
                console.error('Error creating bulk registration notification:', error);
            }
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
// @desc    Track a shipment PUBLICLY
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingNumber: req.params.trackingNumber.toUpperCase() })
            .select('trackingNumber status origin destination history description createdAt');

        if (!shipment) {
            return res.status(404).json({ message: 'Envío no encontrado' });
        }

        res.json(shipment);
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ message: 'Error al consultar tracking' });
    }
});
// @route   POST /api/shipments/bulk-arrival
// @desc    Mark multiple shipments as arrived at destination
// @access  Private/Admin
router.post('/bulk-arrival', protect, async (req, res) => {
    try {
        const { shipmentIds } = req.body;

        if (!shipmentIds || !Array.isArray(shipmentIds)) {
            return res.status(400).json({ message: 'Invalid shipment IDs' });
        }

        const shipments = await Shipment.find({ _id: { $in: shipmentIds } });

        const updatedShipments = [];
        for (const shipment of shipments) {
            shipment.status = 'Llegado a destino';
            shipment.history.push({
                status: 'Llegado a destino',
                location: shipment.destination,
                date: new Date()
            });
            await shipment.save();
            updatedShipments.push(shipment);

            // Notify user
            try {
                await Notification.create({
                    title: '📦 ¡Paquete Llegado!',
                    message: `Tu paquete con código ${shipment.trackingNumber} ya está en ${shipment.destination}. Puedes pasar a recogerlo.`,
                    type: 'success',
                    userId: shipment.user,
                    shipmentId: shipment._id
                });
            } catch (error) {
                console.error(`Error notifying user for shipment ${shipment._id}:`, error);
            }
        }

        res.json({ message: `${updatedShipments.length} envíos actualizados y usuarios notificados.`, updatedCount: updatedShipments.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/shipments/manifest
// @desc    Create a collective package (manifest)
// @access  Private/Admin
router.post('/manifest', protect, async (req, res) => {
    try {
        const { shipmentIds, description } = req.body;
        if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
            return res.status(400).json({ message: 'No shipments selected' });
        }

        const manifestId = `BB-MAN-${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
        
        const manifest = new Manifest({
            manifestId,
            shipments: shipmentIds,
            description
        });

        await manifest.save();
        res.status(201).json(manifest);
    } catch (error) {
        console.error('Error creating manifest:', error);
        res.status(500).json({ message: 'Error creating manifest' });
    }
});

// @route   GET /api/shipments/manifest/:manifestId
// @desc    Get manifest by ID and its shipments
// @access  Private/Admin
router.get('/manifest/:manifestId', protect, async (req, res) => {
    try {
        const manifest = await Manifest.findOne({ manifestId: req.params.manifestId.toUpperCase() })
            .populate({
                path: 'shipments',
                select: 'trackingNumber status destination recipient'
            });

        if (!manifest) {
            return res.status(404).json({ message: 'Manifest not found' });
        }

        res.json(manifest);
    } catch (error) {
        console.error('Error getting manifest:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/shipments/manifest/:manifestId/status
// @desc    Update all shipments in a manifest
// @access  Private/Admin
router.patch('/manifest/:manifestId/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const manifest = await Manifest.findOne({ manifestId: req.params.manifestId.toUpperCase() });

        if (!manifest) {
            return res.status(404).json({ message: 'Manifest not found' });
        }

        const shipments = await Shipment.find({ _id: { $in: manifest.shipments } });
        
        for (const shipment of shipments) {
            shipment.status = status;
            shipment.history.push({
                status,
                location: shipment.destination,
                date: new Date()
            });
            await shipment.save();

            // Notify users
            try {
                if (shipment.user) {
                    await Notification.create({
                        title: `📦 Actualización: ${status}`,
                        message: `Tu paquete ${shipment.trackingNumber} ha cambiado a: ${status}`,
                        type: 'info',
                        userId: shipment.user,
                        shipmentId: shipment._id
                    });
                }
            } catch (err) {
                console.error('Notification error:', err);
            }
        }

        manifest.status = status;
        await manifest.save();

        res.json({ message: `Actualizados ${shipments.length} paquetes a ${status}`, count: shipments.length });
    } catch (error) {
        console.error('Error updating manifest status:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
