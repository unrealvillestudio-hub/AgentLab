// ─── Brand ────────────────────────────────────────────────────────────────────
export type BrandId =
  | 'unrealille-studio'
  | 'patricia-personal'
  | 'patricia-comunidad'
  | 'vizos-salon'
  | 'diamond-details'
  | 'd7-herbal'
  | 'vivose-mask'
  | 'vizos-cosmetics'
  | 'phas';

export interface Brand {
  id: BrandId;
  name: string;
  color: string;
  description: string;
  emoji: string;
}

// ─── Agent ────────────────────────────────────────────────────────────────────
export type ChannelType = 'whatsapp' | 'webchat' | 'voice';
export type AgentStatus = 'draft' | 'testing' | 'active' | 'paused';
export type ModuleView = 'agents' | 'flow' | 'whatsapp' | 'prompts' | 'monitor' | 'test';

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
  connected: boolean;
  webhookUrl: string;
}

export interface WebChatConfig {
  widgetTitle: string;
  welcomeMessage: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  embedCode: string;
}

export interface VoiceConfig {
  voiceId: string;
  language: string;
  provider: 'elevenlabs' | 'openai' | 'custom';
  phoneNumber: string;
}

export interface AgentMetrics {
  totalConversations: number;
  activeConversations: number;
  avgResponseTime: number;
  resolutionRate: number;
  handoffRate: number;
  satisfactionScore: number;
}

export interface Agent {
  id: string;
  brandId: BrandId;
  name: string;
  description: string;
  channel: ChannelType;
  status: AgentStatus;
  systemPrompt: string;
  flowId: string | null;
  whatsappConfig: WhatsAppConfig;
  webChatConfig: WebChatConfig;
  voiceConfig: VoiceConfig;
  tags: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
  metrics: AgentMetrics;
}

// ─── Flow ─────────────────────────────────────────────────────────────────────
export type FlowNodeType = 'start' | 'message' | 'condition' | 'input' | 'action' | 'handoff' | 'end';

export interface FlowCondition {
  id: string;
  label: string;
  keyword: string;
  targetNodeId: string;
}

export type FlowActionType = 'sendMessage' | 'webhook' | 'tagContact' | 'handoffHuman' | 'sendMedia' | 'assignTeam';

export interface FlowAction {
  type: FlowActionType;
  config: Record<string, string>;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  content: string;
  position: number;
  children: string[];
  conditions: FlowCondition[];
  action: FlowAction | null;
  delay: number;
  variableName: string;
}

export interface ConversationFlow {
  id: string;
  agentId: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  entryNodeId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Conversation ─────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'agent' | 'system';
export type ConversationStatus = 'active' | 'waiting' | 'closed' | 'handoff';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  firstSeen: string;
}

export interface Conversation {
  id: string;
  agentId: string;
  contact: Contact;
  channel: ChannelType;
  status: ConversationStatus;
  messages: Message[];
  currentNodeId: string | null;
  startedAt: string;
  lastMessageAt: string;
  tags: string[];
  resolved: boolean;
  satisfaction: number | null;
}

// ─── Test Session ─────────────────────────────────────────────────────────────
export interface TestSession {
  agentId: string;
  messages: Message[];
  isActive: boolean;
  isTyping: boolean;
  startedAt: string;
}

// ─── DB Variables ─────────────────────────────────────────────────────────────
export type DBVarCategory = 'persona' | 'brand' | 'product' | 'tone' | 'contact' | 'custom';

export interface DBVariable {
  id: string;
  key: string;
  value: string;
  brandId: BrandId | 'global';
  category: DBVarCategory;
  description: string;
}

// ─── Templates ────────────────────────────────────────────────────────────────
export type UseCaseType = 'customer-service' | 'sales' | 'support' | 'lead-gen' | 'booking' | 'faq';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  channel: ChannelType;
  systemPromptTemplate: string;
  tags: string[];
  useCase: UseCaseType;
  emoji: string;
}

// ─── Store State ──────────────────────────────────────────────────────────────
export interface AgentLabState {
  agents: Agent[];
  flows: ConversationFlow[];
  conversations: Conversation[];
  testSession: TestSession | null;
  dbVariables: DBVariable[];
  selectedAgentId: string | null;
  selectedFlowId: string | null;
  selectedConversationId: string | null;
  activeModule: ModuleView;
  geminiApiKey: string;
  sidebarOpen: boolean;
}
