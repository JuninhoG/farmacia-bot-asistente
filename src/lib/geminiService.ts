import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `Eres un asistente virtual empático, profesional y experto en farmacia. 
Tu objetivo es responder preguntas sobre suplementos, vitaminas, medicamentos (uso, contraindicaciones básicas) 
y productos de farmacia en general. 
Si una pregunta requiere consulta médica urgente o es potencialmente grave, sugiere siempre consultar a un profesional. 
Mantén un tono cálido, humano y servicial.`;

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
