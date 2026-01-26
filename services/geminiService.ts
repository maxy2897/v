
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (userPrompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  if (!API_KEY) {
    throw new Error("API Key no configurada");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const systemInstruction = `
    Eres el asistente virtual de 'BodipoBusiness', diseñado para responder preguntas basándote únicamente en la información oficial de la página.

    INFORMACIÓN OFICIAL (CONTEXTO):
    
    [LOGÍSTICA Y ENVÍOS]
    - Rutas principales: España ↔ Guinea Ecuatorial ↔ Camerún.
    - TARIFAS ESPAÑA (AÉREO): Malabo (11€/Kg) / Bata (13€/Kg).
    - TARIFAS ESPAÑA (MARÍTIMO): Malabo (4€/Kg) / Bata (5€/Kg). Tiempo estimado: 25-30 días.
    - TARIFAS CAMERÚN: Malabo (3.000 XAF/Kg) / Bata (2.000 XAF/Kg).
    - DOCUMENTOS (G.E. -> ES): 15€ tarifa única.
    - AVISO IMPORTANTE: Los paquetes deben entregarse en almacén A MÁS TARDAR EL DÍA ANTERIOR A LA SALIDA A LAS 15:00 para garantizar su embarque.

    [CALENDARIO DE SALIDAS 2026]
    - PRÓXIMA SALIDA CONFIRMADA: 17 de Enero (Cierre de recepción: día 16 a las 15:00).
    - Siguiente salida: 30 de Enero.
    - Febrero: días 13 y 27.
    - Marzo: días 13 y 27.
    - Nota: Son salidas aéreas regulares.

    [FINANZAS Y CAMBIO]
    - Tasa EURO a CFA: 600 (1€ = 600 XAF).
    - Tasa CFA a EURO: 730 (730 XAF = 1€).
    - Datos Bancarios (Guinea): Ecobank, Titular: SUSANA MBA MIKUE, Cuenta: 39360018962, SWIFT: ECOCGQGQ.
    - Envío Camerún-Guinea: Comisión del 4%.

    [REGLAS DE RESPUESTA]
    1. Si la respuesta está en la información de arriba, dásela al usuario de forma clara y directa.
    2. SI LA INFORMACIÓN NO ESTÁ DISPONIBLE o el usuario quiere más detalles:
       Debes indicarle EXPLICITAMENTE: 
       "Para más información, por favor contacta con un administrador en nuestro canal de WhatsApp: https://whatsapp.com/channel/0029Vb49nL9DOQISuab0Tl3V
       
       O llama a nuestros teléfonos de soporte:
       - Guinea Ecuatorial: +240 222 222 222
       - España: +34 666 666 666"
    3. No inventes información. Si no lo sabes, usa el mensaje de arriba.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role === 'model' ? 'assistant' : 'user', parts: h.parts })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Lo siento, tengo problemas para conectar con mi base de datos. Por favor, inténtalo de nuevo más tarde.";
  }
};
