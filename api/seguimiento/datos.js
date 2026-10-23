// Lo que lee la web para el buscador de códigos (antes datos.json). Sin importes ni teléfonos.
import { conectar, Seguimiento } from './_db.js';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    try {
        await conectar();
        const doc = await Seguimiento.findById('publico').lean();
        if (!doc) return res.status(404).json({ error: 'sin datos' });
        return res.status(200).json(doc.datos);
    } catch (err) {
        console.error('seguimiento/datos:', err.message);
        return res.status(500).json({ error: 'no disponible' });
    }
}
