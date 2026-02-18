import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import Product from '../models/Product.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbrig81ou',
    api_key: process.env.CLOUDINARY_API_KEY || '856675229911861',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'vzvSGxUz_seTZceaQzU6nXaC7lo'
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
router.post('/', protect, admin, async (req, res) => {
    try {
        let { name, color, price, description, image, tag, slogan, waLink } = req.body;

        // Subir imagen a Cloudinary si es base64
        if (image && image.startsWith('data:image')) {
            try {
                // Configurar opciones de subida
                const uploadOptions = {
                    folder: 'bodipo_products',
                    resource_type: 'auto',
                    timeout: 60000 // 60 segundos
                };

                console.log('Iniciando subida a Cloudinary...');
                const result = await cloudinary.uploader.upload(image, uploadOptions);

                image = result.secure_url;
                console.log('✅ Imagen subida con éxito:', image);
            } catch (uploadError) {
                console.error('❌ Error detallado Cloudinary:', JSON.stringify(uploadError, null, 2));
                return res.status(500).json({
                    message: 'Error al subir la imagen a la nube',
                    error: uploadError.message
                });
            }
        }

        const product = await Product.create({
            name,
            color,
            price,
            description,
            image,
            tag,
            slogan,
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
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Borrar imagen de Cloudinary si existe
        if (product.image && product.image.includes('cloudinary')) {
            try {
                console.log('🔍 Analizando imagen para borrar:', product.image);

                // Regex para capturar el public_id:
                // Busca "/upload/", opcionalmente una versión "v12345/", y captura todo hasta el punto de la extensión.
                const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
                const match = product.image.match(regex);

                if (match && match[1]) {
                    const publicId = match[1];
                    console.log('🗑️ Public ID detectado:', publicId);

                    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
                    console.log('✅ Resultado Cloudinary:', result);
                } else {
                    console.log('⚠️ No se pudo extraer el public_id de la URL:', product.image);
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
