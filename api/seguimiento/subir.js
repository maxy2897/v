// Recibe los datos del botón ACTUALIZAR WEB del Excel (antes subir.php).
// Los paquetes quedan públicos, sin importes; lo pendiente de pago se guarda aparte y no sale nunca.
import { conectar, claveCorrecta, Seguimiento } from './_db.js';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).send('solo POST');
    if (!claveCorrecta(req.headers['x-clave'])) return res.status(403).send('clave incorrecta');

    let datos;
    try {
        datos = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
        datos = null;
    }
    if (!datos || typeof datos !== 'object' || !datos.paquetes || typeof datos.paquetes !== 'object') {
        return res.status(400).send('datos no validos');
    }
    const pagos = (datos.pagos && typeof datos.pagos === 'object') ? datos.pagos : {};
    delete datos.pagos;

    // La web sabe así si ofrecer tarjeta (Stripe sin activar) y qué cuenta mostrar para la transferencia.
    datos.tarjeta = false;
    if (process.env.IBAN) datos.cuenta = { iban: process.env.IBAN, titular: process.env.TITULAR || '' };

    try {
        await conectar();
        const ahora = new Date();
        await Seguimiento.bulkWrite([
            { replaceOne: { filter: { _id: 'pagos' }, replacement: { _id: 'pagos', datos: pagos, actualizado: ahora }, upsert: true } },
            { replaceOne: { filter: { _id: 'publico' }, replacement: { _id: 'publico', datos, actualizado: ahora }, upsert: true } },
        ]);
    } catch (err) {
        console.error('seguimiento/subir:', err.message);
        return res.status(500).send('no se pudo guardar');
    }
    return res.status(200).send('ok');
}
