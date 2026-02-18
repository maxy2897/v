import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Product from '../models/Product.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Obtener todos los productos
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// @route   POST /api/products
// @desc    Crear un nuevo producto
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Eliminar un producto
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        await product.deleteOne();
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

export default router;
