import express from 'express';
import { protect, tech } from '../middleware/auth.js';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
router.post('/', protect, tech, async (req, res) => {
    try {
        const { name, color, price, description, tag, slogan, waLink } = req.body;

        // Fotos: acepta `images` (lista, hasta 4) y/o `image` (una sola, versión anterior)
        let fotos = Array.isArray(req.body.images) ? req.body.images.filter(Boolean) : [];
        if (fotos.length === 0 && req.body.image) fotos = [req.body.image];
        fotos = fotos.slice(0, 4);
        if (fotos.length === 0) {
            return res.status(400).json({ message: 'Falta la foto del producto' });
        }

        // Subir a Cloudinary las fotos que vengan en base64
        const subidas = [];
        for (const foto of fotos) {
            if (typeof foto === 'string' && foto.startsWith('data:image')) {
                try {
                    const result = await cloudinary.uploader.upload(foto, {
                        folder: 'bodipo_products',
                        resource_type: 'auto',
                        timeout: 60000
                    });
                    subidas.push(result.secure_url);
                } catch (uploadError) {
                    console.error('❌ Error detallado Cloudinary:', JSON.stringify(uploadError, null, 2));
                    return res.status(500).json({
                        message: 'Error al subir la imagen a la nube',
                        error: uploadError.message
                    });
                }
            } else {
                subidas.push(foto);
            }
        }

        const product = await Product.create({
            name,
            color: color || '',
            price,
            description: description || '',
            image: subidas[0],
            images: subidas,
            tag: tag || '',
            slogan: slogan || '',
            waLink
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Eliminar un producto
// @access  Private/Admin
router.delete('/:id', protect, tech, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Borrar de Cloudinary todas las fotos del producto
        const fotos = Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean)));
        for (const foto of fotos) {
            if (!foto.includes('cloudinary')) continue;
            try {
                const match = foto.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
                if (match && match[1]) {
                    await cloudinary.uploader.destroy(match[1], { invalidate: true });
                }
            } catch (cloudError) {
                console.error('⚠️ Error al borrar imagen de Cloudinary:', cloudError);
            }
        }

        await product.deleteOne(); // Borrar de BD
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

export default router;
