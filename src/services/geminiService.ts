
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
export const getGeminiResponse = async (userPrompt: string, history: any[] = []) => {
  const fetchUrl = `${API_URL}/chat/response`;
  console.log("🚀 Chat: Enviando petición a:", fetchUrl);

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPrompt,
        history: history.map(h => ({
          role: h.role,
          parts: h.parts
        }))
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Error en el servidor de IA');
    }

    return data.response;
  } catch (error: any) {
    console.error("❌ Error llamando al chat backend:", error);

    const errorMessage = error.message || 'desconocido';

    if (errorMessage.includes("fetch") || error.toString().includes("TypeError")) {
      return `Error de conexión: No se pudo conectar con ${fetchUrl}. Verifica el backend y CORS.`;
    }

    return `Error de IA: ${errorMessage.substring(0, 100)}`;
  }
};
