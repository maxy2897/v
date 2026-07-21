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

// Operaciones de logistica: administrador principal, local o tecnico.
export const logistics = (req, res, next) => {
    if (req.user && ['admin', 'admin_local', 'admin_tech'].includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ message: 'No autorizado, requiere acceso a logistica' });
};

// La gestion de roles queda reservada al administrador principal y al tecnico.
export const roleManager = (req, res, next) => {
    if (req.user && ['admin', 'admin_tech'].includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ message: 'No autorizado, requiere nivel principal o tecnico' });
};

// Autenticacion opcional para operaciones que tambien admiten invitados.
export const optionalProtect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido' });
    }
};
