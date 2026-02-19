import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import connectDB from './config/db.js';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import transferRoutes from './routes/transfers.js';
import shipmentRoutes from './routes/shipments.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import configRoutes from './routes/config.js';
import notificationRoutes from './routes/notifications.js';
import productRoutes from './routes/products.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
const envPath = join(__dirname, '../.env.local');
const envRootPath = join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(envRootPath)) {
    dotenv.config({ path: envRootPath });
} else {
    dotenv.config(); // Carga por defecto si existe .env en el CWD
}

// Conectar a la base de datos
connectDB();

const app = express();

// Trust proxy - necesario para Render.com y otros servicios de hosting
app.set('trust proxy', 1);

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        // TEMPORAL: Permitir todo
        callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/config', configRoutes);
import transactionRoutes from './routes/transactions.js';
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// Servir carpeta de uploads estáticamente
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ message: '✅ Server is running!' });
});

// Servir frontend en producción
const distDir = join(__dirname, '../dist');
app.use(express.static(distDir));

// Catch-all para SPA (React Router)
app.get(/^(?!\/api).*/, (req, res) => {
    if (fs.existsSync(join(distDir, 'index.html'))) {
        res.sendFile(join(distDir, 'index.html'));
    } else {
        res.status(404).send('Frontend no compilado. Ejecuta npm run build.');
    }
});

// Self-Ping para mantener activo en Render (aunque recomiendan cron externo)
setInterval(() => {
    // Solo si estamos en producción (podemos chequear VITE_API_URL o NODE_ENV)
    // O simplemente hacer un fetch local si hay url
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
    if (apiUrl) {
        // fetch(`${apiUrl}/api/health`).catch(() => {});
    }
}, 14 * 60 * 1000); // Cada 14 minutos para evitar el sleep de 15 mins

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

