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
        
        const users = await User.find({}).select('name email role virtualCard');
        
        console.log('Total Users Count:', users.length);
        console.log('All Users and Virtual Card state:');
        users.forEach(u => {
          console.log(`- ${u.name} (${u.email}) [${u.role}]: active=${u.virtualCard?.active}, balance=${u.virtualCard?.balance}`);
        });

        console.log('Users:', JSON.stringify(users, null, 2));
        
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
