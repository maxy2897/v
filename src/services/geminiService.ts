
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') ||
  (typeof process !== 'undefined' ? process.env.API_KEY : '') ||
  "";

export const getGeminiResponse = async (userPrompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  if (!API_KEY || API_KEY === "undefined") {
    console.error("Gemini API Key is missing or undefined");
    return "Error: La clave de API de Gemini no está configurada correctamente en el servidor.";
  }

  const genAI = new GoogleGenerativeAI(API_KEY);

  const systemInstruction = `
    Eres el asistente virtual oficial de 'BodipoBusiness' (o Bodipo).
    
    TU PERSONALIDAD:
    - Amable, profesional y eficiente.
    - SIEMPRE saludas de vuelta si el usuario te saluda.
    - Tu objetivo es ayudar con información sobre envíos, tarifas y servicios.
    
    INFORMACIÓN OFICIAL (CONTEXTO ACTUALIZADO 2026):
    
    [LOGÍSTICA Y ENVÍOS]
    - Rutas: España ↔ Guinea Ecuatorial ↔ Camerún.
    - TARIFAS AÉREO DESDE ESPAÑA:
      * Malabo: 11€/Kg
      * Bata: 13€/Kg
    - TARIFAS MARÍTIMO (BIO) DESDE ESPAÑA:
      * Malabo: 4€/Kg
      * Bata: 5€/Kg
      * Tiempo estimado: 25-30 días.
    - TARIFAS DESDE CAMERÚN:
      * Malabo: 3.000 XAF/Kg
      * Bata: 2.000 XAF/Kg
    - ENVÍO DE DOCUMENTOS (G.E. -> ES): Tarifa plana 15€.
    - ENTREGA PAQUETES: Deben estar en almacén el DÍA ANTERIOR a la salida antes de las 15:00.
    
    [FINANZAS Y MONEY TRANSFER]
    - Servicio de transferencia de dinero disponible.
    - Tasa de cambio: 1€ = 600 XAF (EURO a CFA) | 730 XAF = 1€ (CFA a EURO).
    - Comisión envíos Camerún-Guinea: 4%.
    
    [TIENDA OFICIAL]
    - Ropa premium con la marca Bodipo.
    - Envíos internacionales incluidos en el precio.
    - Compra directa a través de WhatsApp.
    
    [CALENDARIO DE SALIDAS]
    - Salidas aéreas semanales.
    - Salidas marítimas mensuales.
    - Consultar fechas exactas en la sección de Calendario de la web o WhatsApp.
    
    [UBICACIONES Y CONTACTO]
    - España: Alcalá de Henares, Madrid (+34 641 992 110).
    - Guinea Ecuatorial: Malabo y Bata (+240 222 667 763).
    - Camerún: Yaoundé (+237 6 87 52 88 54).
    
    [REGLAS DE RESPUESTA STRICTAS]
    1. Responde preguntas basándote SOLO en la información de arriba.
    2. SI NO SABES LA RESPUESTA O LA INFORMACIÓN NO APARECE ARRIBA:
       NO inventes nada. Debes sugerir amablemente que el usuario contacte a través de nuestros números de teléfono o revise nuestras redes sociales.
       
       Teléfonos de contacto:
       - España: +34 641 992 110
       - Guinea Ecuatorial: +240 222 667 763
       - Camerún: +237 6 87 52 88 54
       
       También puedes encontrarnos en redes sociales como 'Bodipo Business'.
       
    3. Si el usuario saluda (Hola, Buenos días), responde cortésmente antes de ofrecer ayuda.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      }
    });

    // Validar el historial: Gemini requiere que los roles se alternen (user, model, user, model...).
    // Y siempre debe comenzar con 'user'.
    let validatedHistory = history.filter(h => h.parts && h.parts[0] && h.parts[0].text && h.parts[0].text.trim() !== "");

    if (validatedHistory.length > 0 && validatedHistory[0].role === 'model') {
      validatedHistory.shift();
    }

    // Asegurarse de que no haya mensajes consecutivos con el mismo rol
    const finalHistory: any[] = [];
    validatedHistory.forEach((msg, idx) => {
      if (idx === 0 || msg.role !== finalHistory[finalHistory.length - 1].role) {
        finalHistory.push(msg);
      }
    });

    const chat = model.startChat({
      history: finalHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;

    return response.text();
  } catch (error: any) {
    console.error("Error DETALLADO de Gemini:", error);

    const errorMsg = error.message || "";
    if (errorMsg.includes("API_KEY_INVALID")) {
      return "Error: La clave de API de Gemini parece no ser válida.";
    }

    if (errorMsg.includes("SAFETY")) {
      return "Lo siento, no puedo responder a eso por motivos de seguridad.";
    }

    if (errorMsg.includes("quota") || errorMsg.includes("429")) {
      return "Error: Se ha superado el límite de uso del servicio. Inténtalo más tarde.";
    }

    // Si llegamos aquí, devolvemos el error real para depuración (temporalmente)
    return `Error técnico de IA: ${errorMsg.substring(0, 100)}... Por favor, contacta con soporte.`;
  }
};
