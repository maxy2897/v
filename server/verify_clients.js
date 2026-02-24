import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Shipment from './models/Shipment.js';

dotenv.config({ path: '../.env.local' });

const updateVerifiedUsers = async () => {
    try {
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        if (!process.env.MONGODB_URI) {
            dotenv.config({ path: '.env.local' });
            dotenv.config({ path: '.env' });
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({ role: 'user' });
        let verifiedCount = 0;

        for (const user of users) {
            const shipmentCount = await Shipment.countDocuments({ user: user._id });
            if (shipmentCount >= 3) {
                user.isVerified = true;
                await user.save();
                verifiedCount++;
                console.log(`Verified user: ${user.email} (Shipments: ${shipmentCount})`);
            }
        }

        console.log(`Successfully verified ${verifiedCount} clients`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

updateVerifiedUsers();
