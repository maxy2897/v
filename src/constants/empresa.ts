// Datos públicos de contacto de Bodipo Business (los usan la portada y el pie de página).
export const EMAIL = 'bodipobusiness019@gmail.com';
export const HORARIO = 'WhatsApp o llamada, de 9:00 a 21:00 h';

export const AGENCIAS = [
  { pais: 'España', ciudad: 'Alcalá de Henares (Madrid)', direccion: 'Avenida de Daganzo 13 B', telefono: '+34 641 992 110', bandera: '/images/bandera-es.jpg', whatsapp: true },
  { pais: 'Guinea Ecuatorial', ciudad: 'Malabo y Bata', direccion: 'B/ Santa María III, Malabo', telefono: '+240 222 667 763', bandera: '/images/bandera-gq.jpg', whatsapp: true },
  { pais: 'Camerún', ciudad: 'Yaundé', direccion: 'Universidad Católica', telefono: '+237 687 528 854', bandera: '', whatsapp: true },
];

export const PUNTOS_RECOGIDA = [
  { lugar: 'España', detalle: 'Avenida de Daganzo 13 B, Alcalá de Henares (Madrid)' },
  { lugar: 'Malabo', detalle: 'Atepa, por la tarde' },
  { lugar: 'Bata', detalle: 'Cruce de Mbangan' },
];

export const REDES = {
  whatsappCanal: 'https://whatsapp.com/channel/0029Vb49nL9DOQISuab0Tl3V',
  instagram: 'https://www.instagram.com/bodipo_business',
  tiktok: 'https://www.tiktok.com/@b.businnes',
};

export const enlaceWhatsApp = (telefono: string) => `https://wa.me/${telefono.replace(/\D/g, '')}`;
export const enlaceTelefono = (telefono: string) => `tel:${telefono.replace(/\s/g, '')}`;
