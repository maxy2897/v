import mongoose from 'mongoose';

const ManifestSchema = new mongoose.Schema({
    manifestId: {
        type: String,
        required: true,
        unique: true,
    },
    shipments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment'
    }],
    status: {
        type: String,
        default: 'Creado'
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Manifest', ManifestSchema);
