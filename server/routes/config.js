import express from 'express';
import { protect, admin, tech } from '../middleware/auth.js';
import Config from '../models/Config.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dbrig81ou',
    api_key: process.env.CLOUDINARY_API_KEY || '856675229911861',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'vzvSGxUz_seTZceaQzU6nXaC7lo'
});

const router = express.Router();

/**
 * @desc    Get current config (Public)
 * @route   GET /api/config
 */
router.get('/', async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            // Create default if not exists
            config = await Config.create({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config' });
    }
});

/**
 * Helper to upload base64 image to Cloudinary
 */
const uploadToCloudinary = async (base64Image, folderName) => {
    if (!base64Image || !base64Image.startsWith('data:image')) return base64Image;
    try {
        const uploadOptions = {
            folder: folderName,
            resource_type: 'auto',
            timeout: 60000
        };
        console.log(`Subiendo imagen a Cloudinary en carpeta ${folderName}...`);
        const result = await cloudinary.uploader.upload(base64Image, uploadOptions);
        console.log(`✅ Imagen subida: ${result.secure_url}`);
        return result.secure_url;
    } catch (err) {
        console.error('❌ Error subiendo imagen a Cloudinary:', err);
        return base64Image; // Fallback al original si falla
    }
};

/**
 * @desc    Update config
 * @route   PUT /api/config
 * @access  Private/Admin
 */
router.put('/', protect, tech, async (req, res) => {
    try {
        let config = await Config.findOne();
        
        // Handle image uploads if present in request body
        if (req.body.customLogoUrl && req.body.customLogoUrl.startsWith('data:image')) {
            req.body.customLogoUrl = await uploadToCloudinary(req.body.customLogoUrl, 'bodipo_config');
        }
        if (req.body.content?.hero?.heroImage && req.body.content.hero.heroImage.startsWith('data:image')) {
            req.body.content.hero.heroImage = await uploadToCloudinary(req.body.content.hero.heroImage, 'bodipo_config');
        }
        if (req.body.content?.hero?.moneyTransferImage && req.body.content.hero.moneyTransferImage.startsWith('data:image')) {
            req.body.content.hero.moneyTransferImage = await uploadToCloudinary(req.body.content.hero.moneyTransferImage, 'bodipo_config');
        }

        if (!config) {
            config = new Config(req.body);
        } else {
            // Update Rates
            if (req.body.rates) {
                if (req.body.rates.air) config.rates.air = { ...config.rates.air, ...req.body.rates.air };
                if (req.body.rates.sea) config.rates.sea = { ...config.rates.sea, ...req.body.rates.sea };
                if (req.body.rates.bulto) config.rates.bulto = { ...config.rates.bulto, ...req.body.rates.bulto };
                if (req.body.rates.exchange) config.rates.exchange = { ...config.rates.exchange, ...req.body.rates.exchange };
            }

            // Update Star Rates
            if (req.body.starRates) {
                config.starRates = { ...config.starRates, ...req.body.starRates };
            }

            // Update Dates
            if (req.body.dates) {
                config.dates = { ...config.dates, ...req.body.dates };
            }

            // Update Content
            if (req.body.content) {
                if (req.body.content.hero) config.content.hero = { ...config.content.hero, ...req.body.content.hero };
                if (req.body.content.social) config.content.social = { ...config.content.social, ...req.body.content.social };
                if (req.body.content.schedule) config.content.schedule = { ...config.content.schedule, ...req.body.content.schedule };
            }

            // Update Contact
            if (req.body.contact) {
                if (req.body.contact.phones) config.contact.phones = { ...config.contact.phones, ...req.body.contact.phones };
                if (req.body.contact.addresses) config.contact.addresses = { ...config.contact.addresses, ...req.body.contact.addresses };
            }

            // Update Bank
            if (req.body.bank) {
                config.bank = { ...config.bank, ...req.body.bank };
            }

            if (req.body.customLogoUrl !== undefined) {
                config.customLogoUrl = req.body.customLogoUrl;
            }
            if (req.body.logoText !== undefined) {
                config.logoText = req.body.logoText;
            }

            config.updatedAt = Date.now();
        }

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } catch (error) {
        console.error('Config Update Error:', error);
        res.status(500).json({ message: 'Error updating config' });
    }
});

export default router;
