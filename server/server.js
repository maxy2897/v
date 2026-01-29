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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env.local') });

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/shipments', shipmentRoutes); // Added shipmentRoutes
app.use('/api/admin', adminRoutes);       // Added adminRoutes
app.use('/api/reports', reportRoutes);     // Added reportRoutes
app.use('/api/config', configRoutes);     // Added configRoutes

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

