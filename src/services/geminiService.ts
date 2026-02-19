
// API URL - Dinámico basado en entorno
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

/**
 * Llama al backend para obtener respuesta de la IA (Gemini)
 * @param userPrompt - El mensaje actual del usuario
 * @param history - El historial de la conversación (opcional)
 */
export const getGeminiResponse = async (userPrompt: string, history: any[] = []) => {
  try {
    const response = await fetch(`${API_URL}/chat/response`, {
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

    if (error.message?.includes("fetch") || error.toString().includes("TypeError")) {
      return "Lo siento, no he podido conectar con el servidor. Por favor, comprueba tu conexión o vuelve a intentarlo en unos momentos.";
    }

    return `Error de IA: ${error.message || 'Ocurrió un problema inesperado'}`;
  }
};
