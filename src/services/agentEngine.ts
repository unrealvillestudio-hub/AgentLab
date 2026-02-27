import type { Agent, ConversationFlow, FlowNode, Contact, Conversation, Message } from '../core/types';
import { nanoid } from 'nanoid';

export function createDefaultAgent(brandId: string, overrides: Partial<Agent> = {}): Agent {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    brandId: brandId as Agent['brandId'],
    name: 'Nuevo Agente',
    description: '',
    channel: 'whatsapp',
    status: 'draft',
    systemPrompt: '',
    flowId: null,
    whatsappConfig: {
      phoneNumberId: '',
      accessToken: '',
      webhookVerifyToken: nanoid(12),
      businessAccountId: '',
      connected: false,
      webhookUrl: '',
    },
    webChatConfig: {
      widgetTitle: 'Chat con nosotros',
      welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
      primaryColor: '#FFAB00',
      position: 'bottom-right',
      embedCode: '',
    },
    voiceConfig: {
      voiceId: '',
      language: 'es-ES',
      provider: 'elevenlabs',
      phoneNumber: '',
    },
    tags: [],
    language: 'es',
    createdAt: now,
    updatedAt: now,
    metrics: {
      totalConversations: 0,
      activeConversations: 0,
      avgResponseTime: 0,
      resolutionRate: 0,
      handoffRate: 0,
      satisfactionScore: 0,
    },
    ...overrides,
  };
}

export function createDefaultFlow(agentId: string): ConversationFlow {
  const now = new Date().toISOString();
  const startNode: FlowNode = {
    id: nanoid(),
    type: 'start',
    label: 'Bienvenida',
    content: '¡Hola! ¿En qué puedo ayudarte? 👋',
    position: 0,
    children: [],
    conditions: [],
    action: null,
    delay: 0,
    variableName: '',
  };
  return {
    id: nanoid(),
    agentId,
    name: 'Flujo Principal',
    description: 'Flujo de conversación por defecto',
    nodes: [startNode],
    entryNodeId: startNode.id,
    createdAt: now,
    updatedAt: now,
  };
}

export function resolvePromptVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return variables[key] ?? match;
  });
}

export function generateEmbedCode(agentId: string, config: Agent['webChatConfig']): string {
  return `<!-- UNRLVL AgentLab WebChat -->
<script>
  window.UNRLVL_CHAT_CONFIG = {
    agentId: "${agentId}",
    title: "${config.widgetTitle}",
    primaryColor: "${config.primaryColor}",
    position: "${config.position}"
  };
</script>
<script src="https://cdn.unrlvl.io/agentlab/webchat.js" async></script>`;
}

export function buildWhatsAppWebhookUrl(agentId: string): string {
  return `https://api.unrlvl.io/webhooks/whatsapp/${agentId}`;
}

export function createMockConversations(agentId: string, count: number): Conversation[] {
  const contacts: Contact[] = [
    { id: 'c1', name: 'María García', phone: '+1 305 555 0101', email: 'maria@example.com', tags: ['cliente'], firstSeen: '2024-01-15T10:00:00Z' },
    { id: 'c2', name: 'Carlos Rodríguez', phone: '+1 786 555 0202', email: 'carlos@example.com', tags: ['lead', 'vip'], firstSeen: '2024-02-20T14:30:00Z' },
    { id: 'c3', name: 'Ana Martínez', phone: '+57 310 555 0303', email: 'ana@example.com', tags: ['cliente', 'recurrente'], firstSeen: '2024-03-01T09:15:00Z' },
    { id: 'c4', name: 'Luis Pérez', phone: '+34 611 555 0404', email: 'luis@example.com', tags: ['prospecto'], firstSeen: '2024-03-10T16:45:00Z' },
    { id: 'c5', name: 'Sofia Jiménez', phone: '+1 954 555 0505', email: 'sofia@example.com', tags: ['cliente'], firstSeen: '2024-03-15T11:20:00Z' },
  ];

  const statuses: Conversation['status'][] = ['active', 'waiting', 'closed', 'handoff'];

  return Array.from({ length: Math.min(count, contacts.length) }, (_, i) => {
    const contact = contacts[i];
    const now = new Date();
    const startTime = new Date(now.getTime() - Math.random() * 86400000 * 7);
    const messages: Message[] = [
      { id: nanoid(), role: 'agent', content: '¡Hola! ¿En qué puedo ayudarte?', timestamp: startTime.toISOString() },
      { id: nanoid(), role: 'user', content: 'Hola, quisiera información sobre sus productos.', timestamp: new Date(startTime.getTime() + 60000).toISOString() },
      { id: nanoid(), role: 'agent', content: '¡Con gusto! Cuéntame, ¿qué producto te interesa?', timestamp: new Date(startTime.getTime() + 120000).toISOString() },
    ];

    return {
      id: nanoid(),
      agentId,
      contact,
      channel: 'whatsapp' as const,
      status: statuses[i % statuses.length],
      messages,
      currentNodeId: null,
      startedAt: startTime.toISOString(),
      lastMessageAt: messages[messages.length - 1].timestamp,
      tags: contact.tags,
      resolved: statuses[i % statuses.length] === 'closed',
      satisfaction: statuses[i % statuses.length] === 'closed' ? Math.floor(Math.random() * 2) + 4 : null,
    };
  });
}
