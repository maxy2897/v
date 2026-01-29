import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/admin
// @desc    Admin dashboard data
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    // Basic placeholder check for admin role
    if (req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized as admin' });
    }

    try {
        const users = await User.find({});
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
