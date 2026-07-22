import express from 'express';
import { protect, finance } from '../middleware/auth.js';
import DeliveryPayment from '../models/DeliveryPayment.js';

const router = express.Router();

const csvCell = (value) => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
};

/**
 * @desc    Export an Excel-compatible delivery payment report
 * @route   GET /api/reports/accounting
 * @access  Private/Finance
 */
router.get('/accounting', protect, finance, async (req, res) => {
    try {
        const filter = {};
        if (req.query.branch) filter.branch = String(req.query.branch);
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(String(req.query.from));
            if (req.query.to) {
                const end = new Date(String(req.query.to));
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const payments = await DeliveryPayment.find(filter).sort({ createdAt: -1 }).lean();
        const headers = [
            'FECHA', 'HORA', 'SUCURSAL', 'TRABAJADOR', 'ROL', 'CODIGO PAQUETE',
            'CLIENTE', 'TELEFONO', 'TIPO DE COBRO', 'TOTAL PAQUETE', 'SALDO ANTES',
            'MONTO ENTREGADO', 'MONTO APLICADO', 'CAMBIO DEVUELTO', 'SALDO PENDIENTE',
            'ESTADO DEL COBRO', 'NOTA'
        ];

        const lines = [headers.map(csvCell).join(';')];
        payments.forEach(payment => {
            const date = new Date(payment.createdAt);
            lines.push([
                date.toLocaleDateString('es-ES'),
                date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                payment.branch,
                payment.worker?.name,
                payment.worker?.role,
                payment.trackingNumber,
                payment.client?.name,
                payment.client?.phone,
                payment.partial ? 'COBRO PARCIAL' : 'COBRO COMPLETO',
                payment.totalDue,
                payment.balanceBefore,
                payment.tenderedAmount,
                payment.appliedAmount,
                payment.changeAmount,
                payment.balanceAfter,
                payment.balanceAfter > 0 ? 'PENDIENTE' : 'PAGADO',
                payment.note
            ].map(csvCell).join(';'));
        });

        const suffix = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_cobros_entregas_${suffix}.csv`);
        res.status(200).send('\uFEFF' + lines.join('\n'));
    } catch (error) {
        console.error('Error generating delivery payment report:', error);
        res.status(500).json({ message: 'Error al generar el reporte de cobros' });
    }
});

export default router;