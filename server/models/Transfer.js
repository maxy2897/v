import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.js';

const TransferSchema = new mongoose.Schema({
    sender: {
        name: { type: String, required: true },
        idDocument: { type: String, required: true, set: encrypt, get: decrypt },
        phone: { type: String, required: true }
    },
    beneficiary: {
        name: { type: String, required: true },
        idDocument: { type: String, set: encrypt, get: decrypt }, // Optional depending on direction
        phone: { type: String }, // Optional depending on direction
        iban: { type: String, set: encrypt, get: decrypt }, // For GQ_ES
        bizum: { type: String, set: encrypt, get: decrypt } // For GQ_ES
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
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

export default mongoose.model('Transfer', TransferSchema);
