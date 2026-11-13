// Temporada de Navidad: decoración de la web (nieve, gorro en el logo, frase de portada).
// Se activa sola del 13 de noviembre al 7 de enero.
export function esNavidad(hoy: Date = new Date()): boolean {
  const m = hoy.getMonth();
  const d = hoy.getDate();
  return (m === 10 && d >= 13) || m === 11 || (m === 0 && d <= 7);
}
