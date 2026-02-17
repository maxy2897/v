import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'shipment_update', 'delivery', 'general'],
        default: 'info'
    },
    // Si es null, la notificación es para todos los usuarios
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Referencia opcional a un envío
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
        default: null
    },
    // Usuarios que ya leyeron la notificación
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Si es true, solo los admins pueden verla
    adminOnly: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null // null = no expira
    }
});

// Índice para mejorar consultas
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', NotificationSchema);
