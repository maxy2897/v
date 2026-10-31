// Respuestas del chat que no necesitan servidor: datos fijos de Bodipo.
// Si la pregunta encaja con un tema conocido se responde aquí (precios siempre al día);
// si no, se intenta el asistente con IA y, si falla, se ofrece WhatsApp.
import { EMAIL, AGENCIAS, PUNTOS_RECOGIDA } from '../constants/empresa';
import { proximasSalidas } from '../constants/salidas';

const WHATSAPP = '+34 641 992 110';

const normalizar = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const fechaLarga = (d: Date) => {
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
};

const salidas = () => {
  const lista = proximasSalidas().slice(0, 3);
  if (!lista.length) return `Estamos preparando el nuevo calendario. Pregúntanos por WhatsApp al ${WHATSAPP}.`;
  return `Próximas salidas aéreas a Malabo y Bata: ${lista.map(fechaLarga).join('; ')}. Los paquetes se entregan hasta las 12:00 del día de salida en Avenida de Daganzo 13 B, Alcalá de Henares. Puedes ver el calendario completo en el apartado Salidas.`;
};

const TEMAS: { claves: string[]; respuesta: () => string }[] = [
  {
    claves: ['salida', 'sale', 'salen', 'proximo envio', 'cuando', 'fecha', 'calendario', 'vuelo'],
    respuesta: salidas,
  },
  {
    claves: ['maritim', 'barco', 'contenedor', 'm3', 'metro cubico'],
    respuesta: () => `Envío marítimo: 470 € por metro cúbico, cajas desde 80 €. Para fechas y presupuesto escríbenos por WhatsApp al ${WHATSAPP}.`,
  },
  {
    claves: ['precio', 'tarifa', 'cuesta', 'cuanto', 'kilo', 'kg', 'cobr', 'maleta', 'bulto', 'documento'],
    respuesta: () =>
      'Tarifas aéreas: Malabo 14 €/kg y Bata 16 €/kg. Bulto de 23 kg: Malabo 320 €, Bata 360 €. Bulto de 32 kg: Malabo 440 €, Bata 500 €. Documentos: 20 € desde España. Marítimo: 470 €/m³, cajas desde 80 €. Puedes calcular tu envío en el apartado Tarifas.',
  },
  {
    claves: ['seguimiento', 'rastre', 'donde esta', 'mi paquete', 'codigo', 'track', 'llegado', 'llego'],
    respuesta: () =>
      'Para ver dónde está tu paquete, escribe tu código en el Centro de Seguimiento de la portada (apartado Seguimiento). Si no tienes el código, pídelo por WhatsApp al ' + WHATSAPP + '.',
  },
  {
    claves: ['money', 'transfer', 'dinero', 'cambio', 'franco', 'cfa', 'xaf', 'divisa', 'enviar dinero', 'bizum'],
    respuesta: () =>
      'Money Transfer: de euro a franco, 1 € = 600 FCFA. De franco a euro, 730 FCFA = 1 €. Rellena el formulario en el apartado Money Transfer y al final te sale el botón para mandarnos el resumen y el justificante por WhatsApp.',
  },
  {
    claves: ['direccion', 'donde estais', 'oficina', 'local', 'almacen', 'recogida', 'recoger', 'ubicacion', 'malabo', 'bata', 'camerun', 'yaunde'],
    respuesta: () =>
      'Nuestras oficinas: ' +
      AGENCIAS.map((a) => `${a.pais}: ${a.direccion}, ${a.ciudad}, tel. ${a.telefono}`).join('. ') +
      '. Puntos de recogida: ' +
      PUNTOS_RECOGIDA.map((p) => `${p.lugar}: ${p.detalle}`).join('; ') + '.',
  },
  {
    claves: ['telefono', 'contacto', 'whatsapp', 'llamar', 'correo', 'email', 'horario', 'hablar', 'persona', 'agente'],
    respuesta: () => `Puedes hablar con nosotros por WhatsApp o llamada al ${WHATSAPP} (de 9:00 a 21:00 h), o por correo a ${EMAIL}.`,
  },
  {
    claves: ['prohibid', 'no se puede', 'permitido', 'que puedo enviar', 'liquido', 'perfume', 'bateria'],
    respuesta: () => `Antes de enviar líquidos, perfumes, baterías o productos delicados, consúltanos por WhatsApp al ${WHATSAPP} y te decimos cómo prepararlo.`,
  },
  {
    claves: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'saludos', 'hey '],
    respuesta: () => '¡Hola! Te puedo ayudar con precios, próximas salidas, seguimiento de paquetes, Money Transfer y direcciones. ¿Qué necesitas?',
  },
  {
    claves: ['gracias', 'vale ', 'perfecto', 'ok '],
    respuesta: () => '¡A ti! Si necesitas algo más, aquí estoy. También nos tienes por WhatsApp en el ' + WHATSAPP + '.',
  },
];

export function respuestaLocal(pregunta: string): string | null {
  const t = ' ' + normalizar(pregunta) + ' ';
  let mejor: { puntos: number; respuesta: () => string } | null = null;
  for (const tema of TEMAS) {
    const puntos = tema.claves.filter((c) => t.includes(' ' + c)).length;
    if (puntos && (!mejor || puntos > mejor.puntos)) mejor = { puntos, respuesta: tema.respuesta };
  }
  return mejor ? mejor.respuesta() : null;
}

export const RESPUESTA_POR_DEFECTO =
  `No tengo esa respuesta ahora mismo. Escríbenos por WhatsApp al ${WHATSAPP} y te atendemos enseguida. También te puedo ayudar con precios, próximas salidas, seguimiento, Money Transfer o direcciones.`;
