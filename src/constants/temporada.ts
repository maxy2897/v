// Temporada de Navidad: decoración de la web (nieve, gorro en el logo, frase de portada).
// Se activa sola del 13 de noviembre al 7 de enero.
export function esNavidad(hoy: Date = new Date()): boolean {
  const m = hoy.getMonth();
  const d = hoy.getDate();
  return (m === 10 && d >= 13) || m === 11 || (m === 0 && d <= 7);
}

// Sorteo Navideño 2026: banner + vídeo en la portada.
// Se ve hasta el 28 de diciembre de 2026 incluido; desde el 29 desaparece solo.
export function esSorteoNavidad(hoy: Date = new Date()): boolean {
  return hoy < new Date(2026, 11, 29);
}
