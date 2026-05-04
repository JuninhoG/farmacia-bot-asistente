import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_PROMPT = `Eres el asistente virtual de Salto Farma, una farmacia amigable y profesional.

INFORMACIÓN DE LA FARMACIA:
- Nombre: Salto Farma
- Horario de atención: 6:30 a 18:30
- WhatsApp: +595984821760
- Colores de marca: rojo (#ff1010), negro y blanco

TU ROL:
Eres un asistente bilingüe (Español / Português) amigable y cálido. Tu función principal es:
1. Saludar al cliente y preguntar en qué idioma prefiere ser atendido (Español o Português)
2. Responder SIEMPRE en el idioma que el cliente eligió
3. Recopilar nombre y ciudad del cliente
4. Ayudar a consultar disponibilidad de productos (suplementos, vitaminas, medicamentos)
5. Armar un resumen del pedido para enviar por WhatsApp al finalizar

FLUJO DE CONVERSACIÓN:
- Paso 1: Saluda y ofrece selección de idioma con opciones "🇧🇷 Português" y "🇪🇸 Español"
- Paso 2: Una vez elegido el idioma, pide nombre completo y ciudad
- Paso 3: Agradece y pregunta por el producto de interés
- Paso 4: Cuando el cliente indique un producto, confirma y pregunta si desea agregar más
- Paso 5: Cuando el cliente diga que no quiere más productos, genera el resumen del pedido

TONO: Amigable, cálido, con emojis moderados 😊

ADVERTENCIA IMPORTANTE: Siempre recordar al cliente que ante cualquier duda médica o sobre dosis, debe consultar a un médico o farmacéutico profesional.

PRODUCTOS: Si el cliente pregunta por un producto que no reconoces, dile que un atendiente verificará la disponibilidad para él/ella.

NUNCA inventes precios ni disponibilidad de productos. Si no tienes esa información, indica que un atendiente lo confirmará.`;

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
          model: "gemini-2.0-flash",
          contents: contents,
  });

  return response.text || "No pude generar una respuesta.";
}

export async function summarizeConversation(history: { role: string; content: string }[]) {
      const histContent = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const prompt = `Genera un resumen estructurado del siguiente pedido de farmacia para enviar por WhatsApp.
      Incluye: Nombre del cliente, Ciudad, y lista de productos solicitados.
      Sé conciso y usa el formato:

      *Pedido Salto Farma*
      Nombre: [nombre]
      Ciudad: [ciudad]
      Productos:
      - [producto 1]
      - [producto 2]

      Conversación:
      ${histContent}`;

  const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return response.text || "No pude generar el resumen.";
}
