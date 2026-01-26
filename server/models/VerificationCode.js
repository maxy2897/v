import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    code: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['email-verification', 'password-reset'],
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - MongoDB eliminará automáticamente documentos expirados
    }
}, {
    timestamps: true
});

// Índice compuesto para búsquedas eficientes
verificationCodeSchema.index({ email: 1, type: 1, used: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;
