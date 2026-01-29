import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Config from '../models/Config.js';

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
 * @desc    Update config
 * @route   PUT /api/config
 * @access  Private/Admin
 */
router.put('/', protect, admin, async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            config = new Config(req.body);
        } else {
            // Update Rates
            if (req.body.rates) {
                if (req.body.rates.air) config.rates.air = { ...config.rates.air, ...req.body.rates.air };
                if (req.body.rates.sea) config.rates.sea = { ...config.rates.sea, ...req.body.rates.sea };
                if (req.body.rates.exchange) config.rates.exchange = { ...config.rates.exchange, ...req.body.rates.exchange };
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
