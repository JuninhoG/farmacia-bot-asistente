/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Info, X } from 'lucide-react';
import { sendMessageToGemini, summarizeConversation } from './lib/geminiService';

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente virtual de Farmacia. ¿En qué puedo ayudarte hoy sobre medicamentos, vitaminas o suplementos?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const closeConversation = async () => {
    setIsClosing(true);
    try {
      const summary = await summarizeConversation(messages);
      const whatsappUrl = `https://wa.me/595987145624?text=${encodeURIComponent(`Resumen de atención FarmaciaBot:\n\n${summary}`)}`;
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error(error);
      alert('Error al cerrar la atención. Por favor, intenta de nuevo.');
      setIsClosing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-slate-800 flex flex-col items-center p-4">
      <header className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-[#004D71]">
          <MessageCircle className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">FarmaCareBot</h1>
        </div>
        <button 
          onClick={closeConversation}
          disabled={isClosing}
          className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2 transition"
        >
          <X className="w-4 h-4" /> {isClosing ? 'Cerrando...' : 'Finalizar Atención'}
        </button>
      </header>
      
      <main className="w-full max-w-2xl bg-white flex-1 p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-5 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-[#004D71] text-white rounded-tr-none shadow-md' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-[#2D9B8E] text-sm italic">FarmaciaBot está escribiendo...</div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta farmacéutica aquí..."
            className="w-full bg-slate-50 border-2 border-transparent focus:border-[#2D9B8E] rounded-xl py-4 pl-6 pr-24 text-sm outline-none transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 px-6 py-2 bg-[#004D71] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-all"
          >
            ENVIAR
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-4">
          Esta IA proporciona información educativa y no reemplaza el consejo médico profesional.
        </p>
      </footer>
    </div>
  );
}

