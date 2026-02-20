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

        // Estrategia de Fallback de Modelos
        // Intentamos secuencialmente con diferentes modelos por si alguno no está disponible en la región
        const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let lastError = null;
        let successResponse = null;
        let usedModel = "";

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

        // Bucle para intentar con cada modelo
        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 Intentando con modelo: ${modelName}`);

                let modelConfig = { model: modelName };
                // gemini-pro (v1.0) a veces prefiere no tener systemInstruction en config object
                if (modelName !== "gemini-pro") {
                    modelConfig.systemInstruction = {
                        role: "system",
                        parts: [{ text: systemInstruction }]
                    };
                }

                const model = genAI.getGenerativeModel(modelConfig);

                const chat = model.startChat({
                    history: finalHistory,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    },
                });

                // Si es gemini-pro, inyectamos el contexto en el prompt
                let promptToSend = userPrompt;
                if (modelName === "gemini-pro") {
                    promptToSend = `${systemInstruction}\n\nUser: ${userPrompt}`;
                }

                const result = await chat.sendMessage(promptToSend);
                const response = await result.response;
                successResponse = response.text();
                usedModel = modelName;

                console.log(`✅ Éxito con modelo: ${modelName}`);
                break; // Salimos del bucle si funciona
            } catch (error) {
                console.warn(`⚠️ Falló modelo ${modelName}: ${error.message}`);
                lastError = error;
                const errMsg = error.message.toLowerCase();
                if (errMsg.includes("api key") || errMsg.includes("safety") || errMsg.includes("permission_denied")) {
                    throw error;
                }
            }
        }

        if (!successResponse) {
            throw lastError || new Error("Todos los modelos fallaron. Verifica tu API Key y acceso a Gemini.");
        }

        res.json({ response: successResponse, model: usedModel });

    } catch (error) {
        console.error("❌ Error en servidor Gemini:", error);

        let errorMsg = error.message;
        if (errorMsg.includes("404") && errorMsg.includes("not found")) {
            errorMsg = "Los modelos de IA solicitados no están disponibles en tu región o cuenta. Verifica la configuración de Google Cloud.";
        }

        res.status(500).json({
            error: `Error en servidor: ${errorMsg}`,
            details: error.stack
        });
    }
});

export default router;
