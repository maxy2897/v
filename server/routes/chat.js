import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Configuración de Gemini (leída del entorno)
const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

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

router.post('/response', async (req, res) => {
    try {
        const { userPrompt, history } = req.body;

        if (!API_KEY || API_KEY === "") {
            console.error("❌ Gemini API Key no configurada en el servidor");
            return res.status(500).json({ error: "API Key no configurada en el servidor" });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        // Usamos 'gemini-pro' que es el modelo más estable y disponible globalmente
        const model = genAI.getGenerativeModel({
            model: "gemini-pro",
        });

        // Validar y limpiar historial para Gemini
        let validatedHistory = (history || []).filter(h => h.parts && h.parts[0] && h.parts[0].text);

        // Debe empezar por usuario
        if (validatedHistory.length > 0 && validatedHistory[0].role === 'model') {
            validatedHistory.shift();
        }

        // Roles alternos
        const finalHistory = [];
        validatedHistory.forEach((msg) => {
            if (finalHistory.length === 0 || msg.role !== finalHistory[finalHistory.length - 1].role) {
                finalHistory.push(msg);
            }
        });

        console.log("🤖 Chat Backend: Procesando mensaje...", {
            hasApiKey: !!API_KEY,
            historySize: finalHistory.length,
            model: "gemini-pro"
        });

        const chat = model.startChat({
            history: finalHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
            },
        });

        // Prepend system instruction to the user prompt if it's a new chat or just include it in context
        // Para gemini-pro, la mejor forma es enviar el contexto en el prompt o como primer turno si es posible.
        // Aquí lo concatenamos al prompt del usuario para asegurar que se tome en cuenta.
        const fullPrompt = `${systemInstruction}\n\nPREGUNTA DEL USUARIO: ${userPrompt}`;

        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error("❌ Error en servidor Gemini:", error);

        let errorMsg = error.message;
        if (errorMsg.includes("404") && errorMsg.includes("not found")) {
            errorMsg = "El modelo de IA solicitado (Gemini Pro) no está disponible o no se encuentra. Verifica la región de tu servidor.";
        }

        res.status(500).json({
            error: `Error en servidor: ${errorMsg}`,
            details: error.stack
        });
    }
});

export default router;
