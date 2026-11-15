// Datos públicos de contacto de Bodipo Business (los usan la portada y el pie de página).
export const EMAIL = 'bodipobusiness019@gmail.com';
export const HORARIO = 'WhatsApp o llamada, de 9:00 a 21:00 h';

export const AGENCIAS = [
  { pais: 'España', ciudad: 'Alcalá de Henares (Madrid)', direccion: 'Avenida de Daganzo 13 B', telefono: '+34 641 992 110', bandera: '/images/bandera-es.jpg', whatsapp: true, mapa: 'Avenida de Daganzo 13B, 28806 Alcalá de Henares, Madrid' },
  { pais: 'Guinea Ecuatorial', ciudad: 'Malabo y Bata', direccion: 'B/ Santa María III, Malabo', telefono: '+240 222 005 843', bandera: '/images/bandera-gq.jpg', whatsapp: false, mapa: 'Santa María III, Malabo, Guinea Ecuatorial' },
  { pais: 'Camerún', ciudad: 'Yaundé', direccion: 'Universidad Católica', telefono: '+237 687 528 854', bandera: '', whatsapp: false, mapa: "Université Catholique d'Afrique Centrale, Yaoundé, Cameroun" },
];

export const PUNTOS_RECOGIDA = [
  { lugar: 'España', detalle: 'Avenida de Daganzo 13 B, Alcalá de Henares (Madrid)', mapa: 'Avenida de Daganzo 13B, 28806 Alcalá de Henares, Madrid' },
  { lugar: 'Malabo', detalle: 'Atepa, por la tarde', mapa: 'Atepa, Malabo, Guinea Ecuatorial' },
  { lugar: 'Bata', detalle: 'Cruce de Mbangan', mapa: 'Mbangan, Bata, Guinea Ecuatorial' },
];

export const REDES = {
  whatsappCanal: 'https://whatsapp.com/channel/0029Vb49nL9DOQISuab0Tl3V',
  instagram: 'https://www.instagram.com/bodipo_business',
  tiktok: 'https://www.tiktok.com/@b.businnes',
};

export const enlaceWhatsApp = (telefono: string) => `https://wa.me/${telefono.replace(/\D/g, '')}`;
export const enlaceTelefono = (telefono: string) => `tel:${telefono.replace(/\s/g, '')}`;

// Google Maps sin clave: enlace para abrir la app ("Cómo llegar") y mapa incrustado.
// "mapa" puede ser una dirección o, cuando Antonio pase el punto exacto, "lat,lng".
export const enlaceMapa = (mapa: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapa)}`;
export const mapaIncrustado = (mapa: string) => `https://maps.google.com/maps?q=${encodeURIComponent(mapa)}&z=16&output=embed`;
