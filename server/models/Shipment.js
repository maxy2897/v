import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    trackingNumber: {
        type: String,
        required: true,
        unique: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    recipient: {
        name: { type: String, required: true },
        phone: { type: String }
    },
    weight: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pendiente', 'En Tránsito', 'En Aduana', 'Entregado'],
        default: 'Pendiente',
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    deliveredAt: {
        type: Date,
    },
});

// Actualizar updatedAt antes de guardar
ShipmentSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.model('Shipment', ShipmentSchema);
