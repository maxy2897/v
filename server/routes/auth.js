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
                    username: user.username,
                    profileImage: user.profileImage,
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
                    username: user.username,
                    profileImage: user.profileImage,
                    discountEligible: user.discountEligible,
                    role: user.role,
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
            username: user.username,
            profileImage: user.profileImage,
            discountEligible: user.discountEligible,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// @route   POST /api/auth/send-verification
// @desc    Enviar código de verificación por email
// @access  Public
router.post(
    '/send-verification',
    [body('email').isEmail().withMessage('Email inválido')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            // Importar dinámicamente para evitar problemas de circular dependency
            const VerificationCode = (await import('../models/VerificationCode.js')).default;
            const { sendVerificationEmail, generateVerificationCode } = await import('../services/emailService.js');

            // Verificar si el usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Verificar si ya está verificado
            if (user.emailVerified) {
                return res.status(400).json({ message: 'El email ya está verificado' });
            }

            // Generar código
            const code = generateVerificationCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            // Guardar código en la base de datos
            await VerificationCode.create({
                email,
                code,
                type: 'email-verification',
                expiresAt
            });

            // Enviar email
            const result = await sendVerificationEmail(email, code);

            res.json({
                message: 'Código de verificación enviado',
                devMode: result.devMode || false
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al enviar código de verificación' });
        }
    }
);

// @route   POST /api/auth/verify-email
// @desc    Verificar email con código
// @access  Public
router.post(
    '/verify-email',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Código inválido')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, code } = req.body;

        try {
            const VerificationCode = (await import('../models/VerificationCode.js')).default;

            // Buscar código válido
            const verificationCode = await VerificationCode.findOne({
                email,
                code,
                type: 'email-verification',
                used: false,
                expiresAt: { $gt: new Date() }
            });

            if (!verificationCode) {
                return res.status(400).json({ message: 'Código inválido o expirado' });
            }

            // Verificar intentos
            if (verificationCode.attempts >= 3) {
                return res.status(400).json({ message: 'Demasiados intentos. Solicita un nuevo código' });
            }

            // Marcar código como usado
            verificationCode.used = true;
            await verificationCode.save();

            // Actualizar usuario
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            user.emailVerified = true;
            await user.save();

            res.json({
                message: 'Email verificado exitosamente',
                emailVerified: true
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al verificar email' });
        }
    }
);

// @route   POST /api/auth/forgot-password
// @desc    Enviar código para resetear contraseña
// @access  Public
router.post(
    '/forgot-password',
    [body('email').isEmail().withMessage('Email inválido')],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            const VerificationCode = (await import('../models/VerificationCode.js')).default;
            const { sendPasswordResetEmail, generateVerificationCode } = await import('../services/emailService.js');

            // Verificar si el usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                // Por seguridad, no revelamos si el email existe o no
                return res.json({ message: 'Si el email existe, recibirás un código de recuperación' });
            }

            // Generar código
            const code = generateVerificationCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            // Guardar código en la base de datos
            await VerificationCode.create({
                email,
                code,
                type: 'password-reset',
                expiresAt
            });

            // Enviar email
            const result = await sendPasswordResetEmail(email, code);

            res.json({
                message: 'Si el email existe, recibirás un código de recuperación',
                devMode: result.devMode || false
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al procesar solicitud' });
        }
    }
);

// @route   POST /api/auth/reset-password
// @desc    Resetear contraseña con código
// @access  Public
router.post(
    '/reset-password',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Código inválido'),
        body('newPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, code, newPassword } = req.body;

        try {
            const VerificationCode = (await import('../models/VerificationCode.js')).default;

            // Buscar código válido
            const verificationCode = await VerificationCode.findOne({
                email,
                code,
                type: 'password-reset',
                used: false,
                expiresAt: { $gt: new Date() }
            });

            if (!verificationCode) {
                return res.status(400).json({ message: 'Código inválido o expirado' });
            }

            // Verificar intentos
            if (verificationCode.attempts >= 3) {
                return res.status(400).json({ message: 'Demasiados intentos. Solicita un nuevo código' });
            }

            // Marcar código como usado
            verificationCode.used = true;
            await verificationCode.save();

            // Actualizar contraseña del usuario
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            user.password = newPassword;
            await user.save();

            res.json({ message: 'Contraseña actualizada exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al resetear contraseña' });
        }
    }
);

export default router;
