import { Product } from '../../types';

/** Cambio para mostrar el precio de la tienda en francos (1 € = TASA_FCFA). */
export const TASA_FCFA = 750;

/** WhatsApp de pedidos (atención al cliente España). */
export const WHATSAPP_PEDIDOS = '34641992110';

/**
 * Catálogo fijo de la tienda (envío incluido en todos los precios).
 * Las fotos están en public/tienda/. Para cambiar un precio, edita `price`.
 * Los productos que se suban desde el panel aparecen después de estos.
 */
export const CATALOGO_TIENDA: Product[] = [
  {
    id: 'camiseta-bodipo',
    name: 'Camiseta Bodipo Business',
    color: 'Blanca · tallas S, M, L y XL',
    price: '35',
    description:
      'Camiseta blanca de manga corta y corte amplio. Delante lleva el logo bb pequeño en el pecho y detrás el diseño grande «Somos tu mejor opción · Recibe bultos desde Europa» sobre un cielo azul.',
    image: '/tienda/camiseta-delante.jpg',
    images: ['/tienda/camiseta-delante.jpg', '/tienda/camiseta-detras.jpg'],
    tallas: ['S', 'M', 'L', 'XL'],
    tag: 'Nuevo',
    slogan: '',
    waLink: '',
  },
  {
    id: 'gorra-bodipo',
    name: 'Gorra Bodipo Business',
    color: 'Blanca y azul marino',
    price: '15',
    description:
      'Gorra estilo trucker con frontal blanco, rejilla trasera transpirable y visera azul marino. Logo bb grande estampado delante. Fresca para el calor y con estilo urbano.',
    image: '/tienda/gorra.jpg',
    images: ['/tienda/gorra.jpg', '/tienda/gorra-real.jpg'],
    tag: '',
    slogan: '',
    waLink: '',
  },
  {
    id: 'bolsa-bodipo',
    name: 'Bolsa Bodipo Business',
    color: 'Blanca · reutilizable',
    price: '10',
    description:
      'Bolsa blanca reutilizable con asas largas para llevar al hombro. Un lado con el logo bb y el otro con la frase «Somos tu mejor opción». Ligera y práctica para la compra, el trabajo o el viaje.',
    image: '/tienda/bolsa-logo.jpg',
    images: ['/tienda/bolsa-logo.jpg', '/tienda/bolsa-frase.jpg'],
    tag: '',
    slogan: '',
    waLink: '',
  },
  {
    id: 'pulsera-bodipo',
    name: 'Pulsera Bodipo Business',
    color: 'Tela azul · cierre ajustable',
    price: '10',
    description:
      'Pulsera de tela en tonos azules con el logo bb y el lema «Cada envío cuenta». Lleva las banderas de España y Guinea Ecuatorial y cierre ajustable; se adapta a cualquier muñeca.',
    image: '/tienda/pulsera.jpg',
    images: ['/tienda/pulsera.jpg'],
    tag: '',
    slogan: '',
    waLink: '',
  },
  {
    id: 'boligrafo-bodipo',
    name: 'Bolígrafo Bodipo Business',
    color: 'Azul',
    price: '5',
    description:
      'Bolígrafo de pulsador en azul con el logo bb y «Bodipo Business» en blanco. Empuñadura cómoda. Ideal para la oficina, el colegio o para regalar.',
    image: '/tienda/boligrafo.jpg',
    images: ['/tienda/boligrafo.jpg'],
    tag: '',
    slogan: '',
    waLink: '',
  },
  {
    id: 'botella-bodipo',
    name: 'Botella Bodipo Business',
    color: 'Aluminio blanco',
    price: '10',
    description:
      'Botella blanca de aluminio con tapón negro de asa para llevarla colgada. Logo bb grande en el frente. Reutilizable, ligera y lista para acompañarte todo el día.',
    image: '/tienda/botella.jpg',
    images: ['/tienda/botella.jpg'],
    tag: '',
    slogan: '',
    waLink: '',
  },
];
