import { Product } from '../../types';

/** Lista de fotos de un producto (la primera es la principal). */
export const fotosDe = (p: Pick<Product, 'image' | 'images'>): string[] => {
  const lista = (p.images || []).filter(Boolean);
  if (lista.length > 0) return lista;
  return p.image ? [p.image] : [];
};

/**
 * Precio en euros. "35" -> "35 €", "35,50" -> "35,50 €".
 * Si ya lleva moneda (€ o FCFA) se deja como está. Los productos antiguos
 * guardados sin moneda y con importes de miles (ej. "10.000") eran francos.
 */
export const precioEnEuros = (precio: string): string => {
  const limpio = (precio || '').trim();
  if (!limpio) return '';
  if (/€|eur|fcfa|xaf/i.test(limpio)) return limpio;
  if (/^\d{1,3}(\.\d{3})+$/.test(limpio) || /^\d{4,}$/.test(limpio)) return `${limpio} FCFA`;
  return `${limpio} €`;
};

/** Reduce una foto a máx. 1600 px y la convierte a JPEG para que la subida sea ligera. */
export const comprimirFoto = (file: File, maxLado = 1600, calidad = 0.85): Promise<string> =>
  new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(lector.error);
    lector.onload = () => {
      const original = lector.result as string;
      const img = new Image();
      img.onerror = () => resolve(original);
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(original);
        // Fondo blanco por si la foto es PNG con transparencia
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = original;
    };
    lector.readAsDataURL(file);
  });
