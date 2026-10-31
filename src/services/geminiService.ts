
// API URL - Dinámico basado en entorno
const FALLBACK_URL = 'https://bodipo-business-api.onrender.com';
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : `${FALLBACK_URL}/api`;


/**
 * Llama al backend para obtener respuesta de la IA (Gemini)
 * @param userPrompt - El mensaje actual del usuario
 * @param history - El historial de la conversación (opcional)
 */
import { respuestaLocal, RESPUESTA_POR_DEFECTO } from './respuestasLocales';

export const getGeminiResponse = async (userPrompt: string, history: any[] = []) => {
  // 1) Temas conocidos: se responden en la propia web, sin servidor.
  const local = respuestaLocal(userPrompt);
  if (local) return local;

  // 2) Resto: se intenta el asistente con IA, con un límite de tiempo.
  const fetchUrl = `${API_URL}/chat/response`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userPrompt,
        history: history.map(h => ({ role: h.role, parts: h.parts })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await response.json();
    if (!response.ok || !data.response) throw new Error(data.error || 'sin respuesta');
    return data.response;
  } catch (error) {
    // 3) Si el asistente no responde, nunca se muestra un error técnico al cliente.
    console.error('Chat IA no disponible:', error);
    return RESPUESTA_POR_DEFECTO;
  }
};
