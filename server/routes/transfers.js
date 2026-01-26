import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import Transfer from '../models/Transfer.js';

import User from '../models/User.js';

const router = express.Router();

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no soportado. Use imagen o PDF.'));
        }
    }
});

// @route   POST /api/transfers
// @desc    Crear nueva solicitud de transferencia
// @access  Public (se recomienda autenticación opcional)
router.post('/', upload.single('proofImage'), [
    // Validaciones básicas que no dependen de multer
    // Nota: express-validator puede tener problemas con form-data si no se configura bien,
    // pero aquí validaremos manualmente los campos requeridos si faltan.
], async (req, res) => {
    try {
        const { sender, beneficiary, amount, currency, direction, user } = req.body;

        // Parsear objetos JSON si vienen como strings (form-data a veces hace esto)
        const senderObj = typeof sender === 'string' ? JSON.parse(sender) : sender;
        const beneficiaryObj = typeof beneficiary === 'string' ? JSON.parse(beneficiary) : beneficiary;

        if (!req.file) {
            return res.status(400).json({ message: 'Por favor suba el comprobante de operación' });
        }

        const transfer = await Transfer.create({
            sender: senderObj,
            beneficiary: beneficiaryObj,
            amount,
            currency,
            direction,
            proofImage: req.file.path,
            user: user || null
        });

        // Consumir descuento si el usuario existe y es elegible
        if (user) {
            const userDoc = await User.findById(user);
            if (userDoc && userDoc.discountEligible) {
                userDoc.discountEligible = false;
                await userDoc.save();
            }
        }

        res.status(201).json(transfer);
    } catch (error) {
        console.error('Error creando transferencia:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
    }
});

export default router;
