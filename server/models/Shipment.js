import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
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
        phone: { type: String },
        email: { type: String }
    },
    sender: {
        name: { type: String },
        phone: { type: String },
        idNumber: { type: String },
        email: { type: String }
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
        enum: ['Pendiente', 'Recogido', 'En tránsito', 'En Aduanas', 'Llegado a destino', 'Entregado', 'Cancelado'],
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
    history: [{
        status: String,
        location: String,
        date: { type: Date, default: Date.now }
    }]
});

// Actualizar updatedAt antes de guardar
ShipmentSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

export default mongoose.model('Shipment', ShipmentSchema);
