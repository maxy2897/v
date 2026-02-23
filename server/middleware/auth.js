import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener usuario del token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado. Por favor inicie sesión nuevamente.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token inválido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

export const admin = (req, res, next) => {
    if (req.user && ['admin', 'admin_local', 'admin_finance', 'admin_tech'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'No autorizado, requiere rol de administrador' });
    }
};

export const finance = (req, res, next) => {
    if (req.user && ['admin', 'admin_finance', 'admin_tech'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'No autorizado, requiere acceso a finanzas' });
    }
};

export const tech = (req, res, next) => {
    if (req.user && ['admin', 'admin_tech'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'No autorizado, requiere nivel técnico' });
    }
};
