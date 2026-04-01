const mongoose = require('mongoose');
require('dotenv').config({ path: './.env.local' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    virtualCard: {
        active: Boolean,
        balance: Number
    }
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found');
        
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        const users = await User.find({ 
            $or: [
                { 'virtualCard.active': true },
                { 'virtualCard.balance': { $gt: 0 } }
            ]
        }).select('name email virtualCard');
        
        console.log('Active Users Count:', users.length);
        console.log('Users:', JSON.stringify(users, null, 2));
        
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
