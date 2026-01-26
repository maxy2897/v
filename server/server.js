import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transferRoutes from './routes/transfers.js';

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
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);

        // Lista de orígenes permitidos
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:4173',
            process.env.FRONTEND_URL, // URL de producción de Vercel
        ].filter(Boolean); // Eliminar valores undefined

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
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

// Servir carpeta de uploads estáticamente
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ message: '✅ Server is running!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

