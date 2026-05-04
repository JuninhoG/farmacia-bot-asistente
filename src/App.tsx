/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Hospital } from 'lucide-react';
import { sendMessageToGemini } from './lib/geminiService';

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: string }[]>([
    { 
      role: 'assistant', 
      content: 'Hola 👋, soy SaltoFarmaBot, asistente virtual de SaltoFarma.\n¿En qué idioma te gustaría ser atendido? 🇪🇸 Español 🇧🇷 Português\nEscribe solo "Español" o "Português" para continuar.', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { 
        role: 'user', 
        content: userMessage, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setIsLoading(true);

    try {
      const response = await sendMessageToGemini(messages, userMessage);
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta de nuevo.', 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split('[MOSTRAR_BOTON_WHATSAPP]');
    return (
        <div>
            {parts.map((part, index) => (
                <div key={index}>
                    {part.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                    {index < parts.length - 1 && (
                        <a 
                            href={`https://wa.me/595984821760?text=${encodeURIComponent(content.replace('[MOSTRAR_BOTON_WHATSAPP]', '').trim())}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-3 bg-[#25D366] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-[#20bd5a] transition-all"
                        >
                            📲 Solicitar Cotización en WhatsApp
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex flex-col">
      <header className="bg-white border-b border-gray-300 p-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="https://i.ibb.co/VWTjC8R1/salto-farma-png.png" alt="SaltoFarma" className="h-10" />
          <h1 className="text-xl font-bold text-black">SaltoFarma</h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
            {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white">
                    <Hospital size={18} />
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-[80%] shadow ${msg.role === 'user' ? 'bg-[#25D366] text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
              <div className="text-sm">{renderContent(msg.content)}</div>
              <span className={`text-[10px] block mt-1 ${msg.role === 'user' ? 'text-green-50' : 'text-slate-500'}`}>{msg.timestamp}</span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="bg-[#f0f2f5] p-3 sticky bottom-0">
        <div className="flex gap-2 items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 bg-white p-3 rounded-lg border focus:outline-none"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="p-3 bg-[#25D366] text-white rounded-full hover:bg-[#20bd5a] transition"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}

