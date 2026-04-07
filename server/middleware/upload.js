import multer from 'multer';
import crypto from 'crypto';

// Configurar multer para subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no soportado. Use imagen o PDF.'));
        }
    }
});

export default upload;
