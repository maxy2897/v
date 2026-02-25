import express from 'express';
import webPush from 'web-push';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Setup Web Push
const initWebPush = () => {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        webPush.setVapidDetails(
            'mailto:admin@bodipobusiness.es',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
    }
};
initWebPush();

// @route   POST /api/notifications/subscribe
// @desc    Subscribe a device for push notifications
// @access  Private
router.post('/subscribe', protect, async (req, res) => {
    try {
        const subscription = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Check if subscription already exists to avoid duplicates
        const exists = user.pushSubscriptions?.some(sub => sub.endpoint === subscription.endpoint);

        if (!exists) {
            if (!user.pushSubscriptions) user.pushSubscriptions = [];
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(201).json({ message: 'Suscripción guardada exitosamente' });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        res.status(500).json({ message: 'Error al procesar suscripción' });
    }
});

// @route   GET /api/notifications
// @desc    Get user notifications (both personal and global)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const isVerified = req.user.isAdmin || req.user.role !== 'user' || req.user.isVerified;
        const globalFilters = { userId: null, adminOnly: false };
        if (!isVerified) {
            globalFilters.verifiedOnly = { $ne: true };
        }

        const query = {
            $and: [
                {
                    $or: [
                        { userId: req.user._id }, // Personal
                        globalFilters // Global
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
        const isVerified = req.user.isAdmin || req.user.role !== 'user' || req.user.isVerified;
        const globalFilters = { userId: null, adminOnly: false };
        if (!isVerified) {
            globalFilters.verifiedOnly = { $ne: true };
        }

        const query = {
            readBy: { $ne: req.user._id },
            $and: [
                {
                    $or: [
                        { userId: req.user._id },
                        globalFilters
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
        const isVerified = req.user.isAdmin || req.user.role !== 'user' || req.user.isVerified;
        const globalFilters = { userId: null, adminOnly: false };
        if (!isVerified) {
            globalFilters.verifiedOnly = { $ne: true };
        }

        await Notification.updateMany(
            {
                $or: [
                    { userId: req.user._id },
                    globalFilters
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
        const { title, message, type, userId, shipmentId, expiresAt, verifiedOnly } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Título y mensaje son requeridos' });
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'general',
            userId: userId || null, // null = global notification
            shipmentId: shipmentId || null,
            expiresAt: expiresAt || null,
            verifiedOnly: verifiedOnly || false
        });

        // Send Push Notifications in background
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            const payload = JSON.stringify({
                title: title,
                body: message,
                icon: '/logo-n.png',
                url: '/#/dashboard'
            });

            const sendPushToUsers = async (users) => {
                for (const u of users) {
                    if (u.pushSubscriptions && u.pushSubscriptions.length > 0) {
                        for (let idx = u.pushSubscriptions.length - 1; idx >= 0; idx--) {
                            const sub = u.pushSubscriptions[idx];
                            try {
                                await webPush.sendNotification(sub, payload);
                            } catch (error) {
                                // If gone, remove it
                                if (error.statusCode === 404 || error.statusCode === 410) {
                                    u.pushSubscriptions.splice(idx, 1);
                                    await u.save();
                                }
                            }
                        }
                    }
                }
            };

            if (userId) {
                // Personal Notification
                const user = await User.findById(userId);
                if (user) await sendPushToUsers([user]);
            } else {
                // Global notification
                const query = verifiedOnly ? { isVerified: true } : {};
                const users = await User.find(query);
                await sendPushToUsers(users);
            }
        }

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
