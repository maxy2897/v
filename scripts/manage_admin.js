import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../server/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env.local') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const listUsers = async () => {
    const users = await User.find({}).select('name email role');
    console.log('\n--- USERS ---');
    if (users.length === 0) {
        console.log('No users found.');
    } else {
        users.forEach(user => {
            console.log(`${user._id}: ${user.name} (${user.email}) - [${user.role || 'user'}]`);
        });
    }
    console.log('-------------\n');
};

const makeAdmin = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        console.log(`User with email ${email} not found.`);
        return;
    }
    user.role = 'admin';
    await user.save();
    console.log(`User ${user.name} (${email}) is now an ADMIN.`);
};

const removeAdmin = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        console.log(`User with email ${email} not found.`);
        return;
    }
    user.role = 'user';
    await user.save();
    console.log(`User ${user.name} (${email}) is now a USER.`);
};

const main = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    const command = args[0];
    const email = args[1];

    if (command === 'list') {
        await listUsers();
    } else if (command === 'make-admin' && email) {
        await makeAdmin(email);
    } else if (command === 'remove-admin' && email) {
        await removeAdmin(email);
    } else {
        console.log('Usage:');
        console.log('  node scripts/manage_admin.js list');
        console.log('  node scripts/manage_admin.js make-admin <email>');
        console.log('  node scripts/manage_admin.js remove-admin <email>');
    }

    process.exit();
};

main();
