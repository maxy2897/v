// Almacén del seguimiento que sube el Excel (botón ACTUALIZAR WEB).
// Sustituye a datos.json y privado/pagos.json del hosting anterior.
import mongoose from 'mongoose';
import crypto from 'crypto';

const SeguimientoSchema = new mongoose.Schema({
    _id: { type: String },          // 'publico' (lo que ve la web) o 'pagos' (importes, privado)
    datos: { type: mongoose.Schema.Types.Mixed },
    actualizado: { type: Date, default: Date.now },
}, { minimize: false });

export const Seguimiento = mongoose.models.Seguimiento ||
    mongoose.model('Seguimiento', SeguimientoSchema, 'seguimiento_excel');

let conexion = null;
export async function conectar() {
    if (mongoose.connection.readyState === 1) return;
    if (!conexion) {
        conexion = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
            .catch((err) => { conexion = null; throw err; });
    }
    await conexion;
}

// Misma comprobación que hash_equals() en PHP.
export function claveCorrecta(recibida) {
    const esperada = process.env.EXCEL_CLAVE || '';
    if (!esperada || typeof recibida !== 'string') return false;
    const a = Buffer.from(esperada);
    const b = Buffer.from(recibida);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}
