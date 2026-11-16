import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: ''
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: true
    },
    // Todas las fotos del producto (la primera es la principal = image)
    images: {
        type: [String],
        default: []
    },
    tag: {
        type: String,
        default: ''
    },
    slogan: {
        type: String,
        default: ''
    },
    waLink: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Product', ProductSchema);
