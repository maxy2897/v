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
import upload from '../middleware/upload.js';

router.put(
    '/profile',
    protect,
    upload.single('profileImage'), // Permitir subida de imagen
    [
        body('name').optional().trim(),
        body('email').optional({ checkFalsy: true }).isEmail(),
        body('phone').optional().trim(),
        body('address').optional().trim(),
        body('username').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user._id);

            if (user) {
                console.log('📝 Updating user:', user._id);
                console.log('📨 Request body:', req.body);
                console.log('📁 Request file:', req.file);

                // Update fields if they are provided (allows clearing text fields)
                if (req.body.name !== undefined) user.name = req.body.name;
                if (req.body.email !== undefined) user.email = req.body.email;
                if (req.body.phone !== undefined) user.phone = req.body.phone;
                if (req.body.address !== undefined) user.address = req.body.address;
                if (req.body.username !== undefined) {
                    user.username = req.body.username.trim() === '' ? undefined : req.body.username;
                }

                if (req.file) {
                    // Normalizar el path para usar barras diagonales (compatibilidad URL)
                    user.profileImage = req.file.path.replace(/\\/g, '/');
                }

                const updatedUser = await user.save();

                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    username: updatedUser.username,
                    profileImage: updatedUser.profileImage,
                    discountEligible: updatedUser.discountEligible,
                    role: updatedUser.role, // Asegurar que el rol siempre se devuelva
                });
            } else {
                res.status(404).json({ message: 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error(error);
            // Manejar error de username duplicado
            if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
                return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
            }
            res.status(500).json({ message: error.message || 'Error del servidor' });
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

            // Consumir descuento si es elegible
            if (req.user.discountEligible) {
                await User.findByIdAndUpdate(req.user._id, { discountEligible: false });
            }

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
