import mongoose from 'mongoose';

const DeliveryPaymentSchema = new mongoose.Schema({
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    trackingNumber: { type: String, required: true, index: true },
    client: {
        name: { type: String, required: true },
        phone: String,
        email: String
    },
    totalDue: { type: Number, required: true, min: 0 },
    tenderedAmount: { type: Number, required: true, min: 0 },
    appliedAmount: { type: Number, required: true, min: 0 },
    changeAmount: { type: Number, default: 0, min: 0 },
    balanceBefore: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    partial: { type: Boolean, default: false },
    branch: { type: String, required: true, trim: true },
    note: { type: String, default: '', trim: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: {
        name: { type: String, required: true },
        email: String,
        role: String
    },
    createdAt: { type: Date, default: Date.now, index: true }
});

DeliveryPaymentSchema.index({ createdAt: -1, branch: 1 });

export default mongoose.model('DeliveryPayment', DeliveryPaymentSchema);