import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars from root .env file
dotenv.config({ path: join(__dirname, '../.env') });

// Import User Model - Adjust path as needed based on structure
// Note: We need dynamic import or path relative to this script
import User from '../server/models/User.js';

const promoteUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.log('\n❌ ERROR: Falta el email.');
        console.log('Uso correcto: node scripts/promoteAdmin.js su_email@ejemplo.com\n');
        process.exit(1);
    }

    // Intentar leer de process.env, si no, usar el hardcoded del README como fallback
    let mongoUri = process.env.MONGODB_URI;

    // FALLBACK FOUND IN README
    if (!mongoUri) {
        console.log('⚠️  No se encontró MONGODB_URI en variables de entorno.');
        console.log('🔄 Intentando conexión con credenciales por defecto (README)...');
        mongoUri = "mongodb+srv://bodipo:bodipo2026@cluster0.mongodb.net/bodipo-business?retryWrites=true&w=majority";
    }

    try {
        console.log('\n📡 Conectando a la base de datos...');
        await mongoose.connect(mongoUri);
        console.log('✅ Conexión establecida.');

        console.log(`🔍 Buscando usuario: ${email}...`);
        // Find user by email (case insensitive)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

        if (!user) {
            console.log(`\n❌ No se encontró ningún usuario registrado con ese email.`);
            console.log('Asegúrate de haberte registrado primero en la web.\n');
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`\nℹ️  El usuario ${user.name} YA es administrador.`);
            process.exit(0);
        }

        // Update role
        user.role = 'admin';
        await user.save(); // validateBeforeSave: false is sometimes safer if schema strict, but regular save is better

        console.log(`\n🎉 ¡ÉXITO! Usuario actualizado correctamente.`);
        console.log(`👤 Nombre: ${user.name}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🛡️  Nuevo Rol: ${user.role.toUpperCase()}`);
        console.log(`\n👉 Ahora puedes acceder al Panel de Admin en la web.\n`);

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Ocurrió un error inesperado:');
        console.error(error);
        process.exit(1);
    }
};

promoteUser();
