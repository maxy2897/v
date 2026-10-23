// Seguimiento del Excel (botón ACTUALIZAR WEB) en Firebase.
// Hosting manda aquí /subir.php, /pagados.php y /datos.json, las mismas direcciones que tenía Hostinger,
// así que el Excel no cambia. Los paquetes van a Firestore, en seguimiento/publico (sin importes)
// y lo pendiente de pago a seguimiento/pagos, que no sale nunca en la web.
import crypto from 'node:crypto';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const EXCEL_CLAVE = defineSecret('EXCEL_CLAVE');
const IBAN = defineSecret('IBAN');
const TITULAR = defineSecret('TITULAR');

initializeApp();
const db = getFirestore();

// Misma comprobación que hash_equals() en PHP.
function claveCorrecta(recibida) {
    const esperada = EXCEL_CLAVE.value() || '';
    if (!esperada || typeof recibida !== 'string') return false;
    const a = Buffer.from(esperada);
    const b = Buffer.from(recibida);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function subir(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    if (req.method !== 'POST') return res.status(405).send('solo POST');
    if (!claveCorrecta(req.get('x-clave'))) return res.status(403).send('clave incorrecta');

    let datos = req.body;
    if (!datos || typeof datos !== 'object' || Buffer.isBuffer(datos)) {
        try { datos = JSON.parse(req.rawBody.toString('utf8')); } catch { datos = null; }
    }
    if (!datos || typeof datos !== 'object' || !datos.paquetes || typeof datos.paquetes !== 'object') {
        return res.status(400).send('datos no validos');
    }
    const pagos = (datos.pagos && typeof datos.pagos === 'object') ? datos.pagos : {};
    delete datos.pagos;

    // La web sabe así si ofrecer tarjeta (Stripe sin activar) y qué cuenta mostrar para la transferencia.
    datos.tarjeta = false;
    if (IBAN.value()) datos.cuenta = { iban: IBAN.value(), titular: TITULAR.value() || '' };

    try {
        const ahora = new Date();
        const lote = db.batch();
        lote.set(db.doc('seguimiento/pagos'), { datos: pagos, actualizado: ahora });
        lote.set(db.doc('seguimiento/publico'), { datos, actualizado: ahora });
        await lote.commit();
    } catch (err) {
        console.error('seguimiento/subir:', err.message);
        return res.status(500).send('no se pudo guardar');
    }
    return res.status(200).send('ok');
}

// El Excel pide aquí los pagos con tarjeta (CODIGO;importe;fecha por línea). Sin Stripe, va vacío.
function pagados(req, res) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    if (!claveCorrecta(req.get('x-clave'))) return res.status(403).send('clave incorrecta');
    return res.status(200).send('');
}

async function datosPublicos(req, res) {
    try {
        const doc = await db.doc('seguimiento/publico').get();
        if (!doc.exists) return res.status(404).json({ error: 'sin datos' });
        return res.status(200).json(doc.get('datos'));
    } catch (err) {
        console.error('seguimiento/datos:', err.message);
        return res.status(500).json({ error: 'no disponible' });
    }
}

export const seguimiento = onRequest(
    { region: 'europe-west1', secrets: [EXCEL_CLAVE, IBAN, TITULAR], maxInstances: 5 },
    async (req, res) => {
        res.set('Cache-Control', 'no-store');
        if (req.path.endsWith('/subir.php')) return subir(req, res);
        if (req.path.endsWith('/pagados.php')) return pagados(req, res);
        if (req.path.endsWith('/datos.json')) return datosPublicos(req, res);
        return res.status(404).send('no encontrado');
    }
);
