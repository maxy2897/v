// El Excel pide aquí los pagos con tarjeta (antes pagados.php): una línea por pago, CODIGO;importe;fecha.
// El pago con tarjeta está sin activar, así que de momento la lista va vacía.
import { claveCorrecta } from './_db.js';

export default function handler(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (!claveCorrecta(req.headers['x-clave'])) return res.status(403).send('clave incorrecta');
    return res.status(200).send('');
}
