import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import Transfer from '../models/Transfer.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { optionalProtect } from '../middleware/auth.js';

import User from '../models/User.js';

const router = express.Router();

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'private_uploads/');
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
router.post('/', optionalProtect, upload.single('proofImage'), [
    // Validaciones básicas que no dependen de multer
    // Nota: express-validator puede tener problemas con form-data si no se configura bien,
    // pero aquí validaremos manualmente los campos requeridos si faltan.
], async (req, res) => {
    try {
        const { sender, beneficiary, amount, currency, direction, category, description, type: reqType } = req.body;

        // Parsear objetos JSON si vienen como strings (form-data a veces hace esto)
        const senderObj = typeof sender === 'string' ? JSON.parse(sender) : sender;
        const beneficiaryObj = typeof beneficiary === 'string' ? JSON.parse(beneficiary) : beneficiary;

        if (!req.file) {
            return res.status(400).json({ message: 'Por favor suba el comprobante de operación' });
        }

        // El esquema de Transfer requiere 'CFA' o 'EUR'
        // El frontend a veces envía 'XAF', lo normalizamos.
        const normalizedCurrency = (currency === 'XAF') ? 'CFA' : (currency || 'CFA');

        const transfer = await Transfer.create({
            sender: senderObj,
            beneficiary: beneficiaryObj,
            amount: Number(amount),
            currency: normalizedCurrency,
            direction: direction || 'GQ_ES',
            proofImage: req.file.path,
            user: req.user?._id || null
        });

        // Consumir descuento si el usuario existe y es elegible
        if (req.user) {
            const userDoc = await User.findById(req.user._id);
            if (userDoc && userDoc.discountEligible) {
                userDoc.discountEligible = false;
                await userDoc.save();
            }
        }

        // Crear registro de transacción para recibo
        // Validar que el tipo esté en el enum de Transaction: ['SHIPMENT', 'SHIPMENT_BULK', 'TRANSFER', 'STORE_PURCHASE']
        const validTypes = ['SHIPMENT', 'SHIPMENT_BULK', 'TRANSFER', 'STORE_PURCHASE'];
        const transactionType = validTypes.includes(reqType) ? reqType : 'TRANSFER';

        const transaction = await Transaction.create({
            type: transactionType,
            referenceId: transfer._id,
            userId: req.user?._id || null,
            onModel: 'Transfer',
            amount: Number(amount),
            currency: normalizedCurrency,
            user: {
                name: senderObj.name,
                phone: senderObj.phone,
                email: senderObj.email // Si existe
            },
            details: {
                beneficiary: beneficiaryObj.name,
                direction: direction || 'GQ_ES',
                proofImage: req.file.path,
                category: category || 'Transferencia',
                description: description || 'Envío de dinero'
            }
        });

        // Notificación para el Admin
        try {
            await Notification.create({
                title: category === 'Recarga Tarjeta' ? 'Solicitud de Activación Tarjeta' : 'Nueva Solicitud de Dinero',
                message: `${senderObj.name} ha solicitado ${category === 'Recarga Tarjeta' ? 'activar su tarjeta' : 'un envío'} de ${amount} ${currency}.`,
                type: 'info',
                adminOnly: true
            });
        } catch (error) {
            console.error('Error creating transfer notification:', error);
        }

        res.status(201).json({ ...transfer.toObject(), transactionId: transaction._id });
    } catch (error) {
        console.error('Error creando transferencia:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
    }
});

export default router;
