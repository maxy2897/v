import express from 'express';
import Notification from '../models/Notification.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications (both personal and global)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = {
            $and: [
                {
                    $or: [
                        { userId: req.user._id }, // Personal
                        { userId: null, adminOnly: false } // Global
                    ]
                },
                {
                    $or: [
                        { expiresAt: null }, // Persistent
                        { expiresAt: { $gt: new Date() } } // Not expired
                    ]
                }
            ]
        };

        // Admins can also see notifications flagged for them
        if (req.user.isAdmin) {
            query.$and[0].$or.push({ adminOnly: true });
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('shipmentId', 'trackingNumber destination status');

        // Mark which ones are read by this user
        const notificationsWithReadStatus = notifications.map(notif => ({
            ...notif.toObject(),
            isRead: notif.readBy.includes(req.user._id)
        }));

        res.json(notificationsWithReadStatus);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const query = {
            readBy: { $ne: req.user._id },
            $and: [
                {
                    $or: [
                        { userId: req.user._id },
                        { userId: null, adminOnly: false }
                    ]
                },
                {
                    $or: [
                        { expiresAt: null },
                        { expiresAt: { $gt: new Date() } }
                    ]
                }
            ]
        };

        if (req.user.isAdmin) {
            query.$and[0].$or.push({ adminOnly: true });
        }

        const count = await Notification.countDocuments(query);

        res.json({ count });
    } catch (error) {
        console.error('Error counting notifications:', error);
        res.status(500).json({ message: 'Error al contar notificaciones' });
    }
});

// @route   POST /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.post('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        // Add user to readBy array if not already there
        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error al marcar notificación' });
    }
});

// @route   POST /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                $or: [
                    { userId: req.user._id },
                    { userId: null, adminOnly: false }
                ],
                readBy: { $ne: req.user._id }
            },
            {
                $addToSet: { readBy: req.user._id }
            }
        );

        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Error al marcar notificaciones' });
    }
});

// ========== ADMIN ROUTES ==========

// @route   POST /api/notifications
// @desc    Create a new notification (admin only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, message, type, userId, shipmentId, expiresAt } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Título y mensaje son requeridos' });
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'general',
            userId: userId || null, // null = global notification
            shipmentId: shipmentId || null,
            expiresAt: expiresAt || null
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Error al crear notificación' });
    }
});

// @route   GET /api/notifications/admin/all
// @desc    Get all notifications (admin only)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('shipmentId', 'trackingNumber destination')
            .limit(100);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notificación eliminada' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Error al eliminar notificación' });
    }
});

export default router;
