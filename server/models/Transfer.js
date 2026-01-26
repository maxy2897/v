import mongoose from 'mongoose';

const TransferSchema = new mongoose.Schema({
    sender: {
        name: { type: String, required: true },
        idDocument: { type: String, required: true },
        phone: { type: String, required: true }
    },
    beneficiary: {
        name: { type: String, required: true },
        idDocument: { type: String }, // Optional depending on direction
        phone: { type: String }, // Optional depending on direction
        iban: { type: String }, // For GQ_ES
        bizum: { type: String } // For GQ_ES
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ['EUR', 'CFA'], required: true },
    direction: {
        type: String,
        enum: ['ES_GQ', 'GQ_ES', 'CM_GQ'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending'
    },
    proofImage: { type: String }, // Path to uploaded file
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Transfer', TransferSchema);
