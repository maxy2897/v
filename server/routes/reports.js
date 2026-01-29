import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import Transfer from '../models/Transfer.js';

const router = express.Router();

/**
 * @desc    Generate monthly accounting report (CSV)
 * @route   GET /api/reports/accounting
 * @access  Private/Admin
 */
router.get('/accounting', protect, admin, async (req, res) => {
    try {
        // 1. Fetch Data (Last 30 days or All - defaulting to ALL for now as per request "cada vez que se registre")
        // To help accounting, we usually want everything or filtered by date. 
        // For simplicity v1, we fetch ALL history sorted by date.

        const users = await User.find({}).sort({ createdAt: -1 }).lean();
        const shipments = await Shipment.find({}).sort({ createdAt: -1 }).lean();
        const transfers = await Transfer.find({}).sort({ createdAt: -1 }).lean();

        // 2. Flatten and Unify Data
        // We want a single timeline of financial/activity events

        let rows = [];

        // Process Shipments
        shipments.forEach(ship => {
            rows.push({
                date: new Date(ship.createdAt),
                type: 'ENVÍO PAQUETE',
                client: ship.user ? ship.user.toString() : 'N/A', //Ideally populate checking user name if needed, but ID is safe
                description: `Rastreo: ${ship.trackingNumber} | ${ship.origin} -> ${ship.destination} | ${ship.weight}Kg`,
                amount: ship.price,
                currency: 'XAF/EUR', // Mixed currently, usually EUR for Spain->GQ
                status: ship.status
            });
        });

        // Process Transfers
        transfers.forEach(trans => {
            rows.push({
                date: new Date(trans.createdAt),
                type: 'ENVÍO DINERO',
                client: trans.sender.name,
                description: `${trans.direction} | Benef: ${trans.beneficiary.name}`,
                amount: trans.amount,
                currency: trans.currency,
                status: trans.status
            });
        });

        // Process Users (Registrations) - Zero monetary value but good for tracking growth
        users.forEach(user => {
            rows.push({
                date: new Date(user.createdAt),
                type: 'REGISTRO USUARIO',
                client: user.name,
                description: `Email: ${user.email} | Tel: ${user.phone || 'N/A'}`,
                amount: 0,
                currency: '-',
                status: 'Activo'
            });
        });

        // Sort by Date Descending
        rows.sort((a, b) => b.date - a.date);

        // 3. Generate CSV String
        const headers = ['FECHA', 'TIPO OPERACION', 'CLIENTE', 'DESCRIPCION', 'MONTO', 'MONEDA', 'ESTADO'];

        let csvContent = headers.join(';') + '\n'; // Using semicolon for Excel compatibility in EU regions

        rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0]; // YYYY-MM-DD
            const cleanDesc = row.description ? row.description.replace(/;/g, ',').replace(/\n/g, ' ') : '';
            const cleanClient = row.client ? row.client.replace(/;/g, ',') : 'Anonimo';

            const line = [
                dateStr,
                row.type,
                cleanClient,
                cleanDesc,
                row.amount,
                row.currency,
                row.status
            ].join(';');
            csvContent += line + '\n';
        });

        // 4. Send File
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_bodipo_contabilidad.csv');
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Error al generar el reporte' });
    }
});

export default router;
