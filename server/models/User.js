import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor ingrese su nombre'],
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Permite nulos pero si existe debe ser único
        trim: true
    },
    profileImage: {
        type: String, // URL/Path de la imagen
    },
    email: {
        type: String,
        required: [true, 'Por favor ingrese su email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingrese un email válido',
        ],
    },
    password: {
        type: String,
        required: [true, 'Por favor ingrese una contraseña'],
        minlength: 6,
        select: false,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    idNumber: {
        type: String,
        trim: true,
    },
    discountEligible: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Encriptar password antes de guardar
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
