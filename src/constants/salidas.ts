// Calendario oficial de salidas aéreas (España → Malabo / Bata). Lo usan el calendario y el anuncio de arriba.
export const SALIDAS_AEREAS: Date[] = [
  new Date(2026, 9, 13), new Date(2026, 9, 27),
  new Date(2026, 10, 10), new Date(2026, 10, 28),
  new Date(2026, 11, 8), new Date(2026, 11, 22), new Date(2026, 11, 29),
];

// Salidas de hoy en adelante, en orden.
export function proximasSalidas(hoy: Date = new Date()): Date[] {
  const inicio = new Date(hoy);
  inicio.setHours(0, 0, 0, 0);
  return [...SALIDAS_AEREAS].filter((d) => d >= inicio).sort((a, b) => a.getTime() - b.getTime());
}
