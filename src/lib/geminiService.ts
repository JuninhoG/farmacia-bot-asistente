import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `Eres el asistente virtual amigable de SaltoFarma, una farmacia comprometida con el bienestar de sus clientes.

Tu nombre es SaltoFarmaBot.

INFORMACIÓN IMPORTANTE:
- Horario de atención: Lunes a Sábado de 6:30 a 18:30
- Para consultas sobre disponibilidad de productos específicos, puedes orientar al cliente pero recomienda llamar o visitar la farmacia para confirmar stock en tiempo real.
- Número de WhatsApp para atención directa: https://wa.me/595984821760

INSTRUCCIONES DE COMPORTAMIENTO:
- Sé siempre amigable, cálido y empático
- Usa un lenguaje cercano y accesible, no muy técnico
- Responde preguntas sobre medicamentos, vitaminas, suplementos, productos de higiene y cuidado personal
- Si alguien pregunta por disponibilidad de un producto, indica que puedes orientarle sobre el tipo de producto pero que para confirmar stock actual deben contactar la farmacia por WhatsApp o visitar en persona
- Si alguien necesita atención urgente o consulta médica, recomienda consultar con un profesional de salud
- Siempre menciona el horario cuando sea relevante: 6:30 a 18:30
- Al despedirte, recuerda al cliente que puede contactar por WhatsApp: https://wa.me/595984821760

PREGUNTAS FRECUENTES QUE DEBES MANEJAR:
- Disponibilidad de productos: orienta y recomienda contactar para confirmar stock
- Horarios: 6:30 a 18:30 de lunes a sábado
- Ubicación: indica que pueden contactar por WhatsApp para más información
- Precios: indica que los precios pueden variar y recomienda consultar directamente

Mantén respuestas concisas pero completas. Usa emojis ocasionalmente para hacer la conversación más amigable.`;

export async function sendMessageToGemini(history: { role: string; content: string }[], newMessage: string) {
    // Note: Since this SDK uses `ai.models.generateContent`, 
    // it's not a `chat` object in the same way, we'd need to reconstruct the history.
    // Let's implement keeping history by sending all messages.

    const contents = [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
    });
    return response.text || "No pude generar una respuesta.";
}

export async function summarizeConversation(history: { role: string; content: string }[]) {
    const chatContent = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const prompt = `Por favor, haz un resumen breve de la siguiente conversación de soporte farmacéutico. 
    Este resumen será enviado por WhatsApp al cliente para su referencia. Sé profesional y conciso.
    
    Conversación:
    ${chatContent}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });
    return response.text || "No se pudo generar el resumen.";
}
