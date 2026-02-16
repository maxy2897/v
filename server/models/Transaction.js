import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['SHIPMENT', 'TRANSFER', 'STORE_PURCHASE'],
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Shipment', 'Transfer', 'Order']
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'EUR'
    },
    user: {
        name: String,
        email: String,
        phone: String
    },
    details: {
        type: Object
    },
    status: {
        type: String,
        default: 'COMPLETED'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Transaction', TransactionSchema);
