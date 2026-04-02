import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generar JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('El nombre es requerido'),
        body('email').isEmail().withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('phone').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, address } = req.body;

        try {
            // Verificar si el usuario ya existe
            const userExists = await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            // Crear usuario
            const user = await User.create({
                name,
                email,
                password,
                phone,
                address,
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    discountEligible: user.discountEligible,
                    token: generateToken(user._id),
                });
            } else {
                res.status(400).json({ message: 'Datos de usuario inválidos' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Buscar usuario por email
            const user = await User.findOne({ email }).select('+password');

            if (user && (await user.matchPassword(password))) {
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    discountEligible: user.discountEligible,
                    token: generateToken(user._id),
                });
            } else {
                res.status(401).json({ message: 'Email o contraseña incorrectos' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error del servidor' });
        }
    }
);

// @route   GET /api/auth/me
// @desc    Obtener datos del usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            discountEligible: user.discountEligible,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router;
