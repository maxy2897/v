import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../server/models/User.js';
import Shipment from '../server/models/Shipment.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const emails = ['admin@test.com', 'user@test.com'];
        // Find users
        const users = await User.find({ email: { $in: emails } });
        const userIds = users.map(u => u._id);

        // Delete Shipments created by test users
        if (userIds.length > 0) {
            const res = await Shipment.deleteMany({ user: { $in: userIds } });
            console.log(`Deleted ${res.deletedCount} test shipments`);
        }

        // Delete Users
        const res2 = await User.deleteMany({ email: { $in: emails } });
        console.log(`Deleted ${res2.deletedCount} test users`);

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanup();
