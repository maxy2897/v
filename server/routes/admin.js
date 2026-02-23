import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Admin dashboard data
// @access  Private/SuperAdmin
router.get('/users', protect, admin, async (req, res) => {
    try {
        if (!['admin', 'admin_tech'].includes(req.user.role)) {
            return res.status(403).json({ message: 'No autorizado, requiere privilegios de Administrador Principal o Técnico' });
        }
        const users = await User.find({}).select('-password');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/SuperAdmin
router.put('/users/:id/role', protect, async (req, res) => {
    try {
        // Solo el administrador principal o técnico puede asignar roles a otros
        if (!['admin', 'admin_tech'].includes(req.user.role)) {
            return res.status(403).json({ message: 'No autorizado, requiere privilegios de Administrador Principal o Técnico' });
        }

        const { role } = req.body;
        const validRoles = ['user', 'admin', 'admin_local', 'admin_finance', 'admin_tech'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Rol proporcionado no es válido' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Evitar que el admin se quite su propio rol por accidente
        if (user._id.toString() === req.user._id.toString() && role !== req.user.role) {
            return res.status(400).json({ message: 'No puedes cambiarte tu propio rol administrativo' });
        }

        user.role = role;
        const updatedUser = await user.save();

        res.json({
            message: 'Rol actualizado exitosamente',
            user: { _id: updatedUser._id, name: updatedUser.name, role: updatedUser.role }
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Server Error al actualizar rol' });
    }
});

import Shipment from '../models/Shipment.js';
import Transaction from '../models/Transaction.js';
import Transfer from '../models/Transfer.js';
import Notification from '../models/Notification.js';

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and all their associated data
// @access  Private/SuperAdmin
router.delete('/users/:id', protect, async (req, res) => {
    try {
        if (!['admin', 'admin_tech'].includes(req.user.role)) {
            return res.status(403).json({ message: 'No autorizado, requiere privilegios de Administrador Principal o Técnico' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Evitar auto-eliminación
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta desde aquí' });
        }

        // Eliminar dependencias
        await Shipment.deleteMany({ user: user._id });
        await Transaction.deleteMany({ userId: user._id });
        await Transfer.deleteMany({ user: user._id });
        await Notification.deleteMany({ userId: user._id });
        await Notification.updateMany({}, { $pull: { readBy: user._id } });

        // Eliminar usuario
        await User.findByIdAndDelete(user._id);

        res.json({ message: 'Usuario y todos sus datos relacionados han sido eliminados correctamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error al eliminar usuario' });
    }
});

export default router;
