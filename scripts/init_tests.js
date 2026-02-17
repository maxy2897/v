import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../server/models/User.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const createUsers = async () => {
    await connectDB();

    const adminEmail = 'admin@test.com';
    const userEmail = 'user@test.com';
    const password = 'password123';

    try {
        // Delete existing test users
        await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });

        // Create Admin
        const salt = await bcrypt.genSalt(10); // user model handles encryption pre-save, but if we use simple create we rely on model hooks? 
        // User model has pre-save hook. So we should just create instances or use create() with plain text password.

        await User.create({
            name: 'Test Admin',
            email: adminEmail,
            password: password,
            role: 'admin',
            emailVerified: true
        });
        console.log('Admin user created');

        // Create User
        await User.create({
            name: 'Test User',
            email: userEmail,
            password: password,
            role: 'user',
            emailVerified: true
        });
        console.log('Regular user created');

        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
