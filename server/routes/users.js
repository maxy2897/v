import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Obtener perfil del usuario
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @route   PUT /api/users/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put(
    '/profile',
    protect,
    [
        body('name').optional().trim(),
        body('email').optional().isEmail(),
        body('phone').optional().trim(),
        body('address').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user._id);

            if (user) {
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                user.phone = req.body.phone || user.phone;
                user.address = req.body.address || user.address;

                const updatedUser = await user.save();

                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    discountEligible: updatedUser.discountEligible,
                });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
);

// @route   GET /api/users/shipments
// @desc    Obtener envíos del usuario
// @access  Private
router.get('/shipments', protect, async (req, res) => {
    try {
        const shipments = await Shipment.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(shipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @route   POST /api/users/shipments
// @desc    Crear nuevo envío
// @access  Private
router.post(
    '/shipments',
    protect,
    [
        body('trackingNumber').notEmpty().withMessage('Número de rastreo requerido'),
        body('origin').notEmpty().withMessage('Origen requerido'),
        body('destination').notEmpty().withMessage('Destino requerido'),
        body('weight').isNumeric().withMessage('Peso debe ser numérico'),
        body('price').isNumeric().withMessage('Precio debe ser numérico'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { trackingNumber, origin, destination, weight, price, description } =
            req.body;

        try {
            const shipment = await Shipment.create({
                user: req.user._id,
                trackingNumber,
                origin,
                destination,
                weight,
                price,
                description,
            });

            res.status(201).json(shipment);
        } catch (error) {
            console.error(error);
            if (error.code === 11000) {
                res
                    .status(400)
                    .json({ message: 'El número de rastreo ya existe' });
            } else {
                res.status(500).json({ message: 'Error del servidor' });
            }
        }
    }
);

export default router;
