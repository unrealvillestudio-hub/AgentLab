import type { Agent, Message } from '../core/types';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateAgentResponse(
  agent: Agent,
  conversationHistory: Message[],
  userMessage: string,
  apiKey: string
): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    return simulateAgentResponse(agent, userMessage);
  }

  const systemInstruction = agent.systemPrompt || `Eres ${agent.name}, un asistente virtual útil y profesional.`;

  const history: GeminiMessage[] = conversationHistory
    .filter((m) => m.role !== 'system')
    .slice(-10)
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return simulateAgentResponse(agent, userMessage);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? simulateAgentResponse(agent, userMessage);
  } catch (e) {
    console.error('Gemini fetch error:', e);
    return simulateAgentResponse(agent, userMessage);
  }
}

function simulateAgentResponse(agent: Agent, userMessage: string): string {
  const lower = userMessage.toLowerCase();
  const name = agent.name;

  if (lower.includes('hola') || lower.includes('hi') || lower.includes('buenas')) {
    return `¡Hola! Soy ${name}. ¿En qué puedo ayudarte hoy? 👋`;
  }
  if (lower.includes('precio') || lower.includes('costo') || lower.includes('cuánto')) {
    return `Para información sobre precios, puedo ayudarte directamente. ¿Sobre qué producto o servicio te gustaría saber? 💰`;
  }
  if (lower.includes('pedido') || lower.includes('orden') || lower.includes('envío')) {
    return `Para consultar tu pedido, necesito tu número de orden. ¿Podrías proporcionármelo? 📦`;
  }
  if (lower.includes('gracias') || lower.includes('thank')) {
    return `¡Con mucho gusto! Estoy aquí si necesitas algo más. 😊`;
  }
  if (lower.includes('horario') || lower.includes('abierto')) {
    return `Nuestros horarios de atención son de Lunes a Sábado, 9am–6pm. ¿Hay algo más que pueda ayudarte? ⏰`;
  }
  if (lower.includes('humano') || lower.includes('asesor') || lower.includes('persona')) {
    return `Claro, te conecto con uno de nuestros asesores. Por favor espera un momento... 🤝`;
  }

  return `Entendido. Como ${name}, estoy aquí para ayudarte. ¿Podrías darme más detalles sobre lo que necesitas? 🤖`;
}
