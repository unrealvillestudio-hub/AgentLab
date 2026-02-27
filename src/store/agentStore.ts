import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  AgentLabState,
  Agent,
  ConversationFlow,
  Conversation,
  FlowNode,
  Message,
  ModuleView,
  DBVariable,
  TestSession,
} from '../core/types';
import { DEFAULT_DB_VARIABLES } from '../config/presets';
import { createDefaultAgent, createDefaultFlow, createMockConversations } from '../services/agentEngine';

interface AgentLabActions {
  // Navigation
  setActiveModule: (module: ModuleView) => void;
  setSelectedAgent: (id: string | null) => void;
  setSelectedFlow: (id: string | null) => void;
  setSelectedConversation: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setGeminiApiKey: (key: string) => void;

  // Agents
  addAgent: (brandId: string, overrides?: Partial<Agent>) => Agent;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  duplicateAgent: (id: string) => void;

  // Flows
  addFlow: (agentId: string) => ConversationFlow;
  updateFlow: (id: string, updates: Partial<ConversationFlow>) => void;
  deleteFlow: (id: string) => void;
  addFlowNode: (flowId: string, node: Omit<FlowNode, 'id'>) => FlowNode;
  updateFlowNode: (flowId: string, nodeId: string, updates: Partial<FlowNode>) => void;
  deleteFlowNode: (flowId: string, nodeId: string) => void;
  reorderFlowNodes: (flowId: string, nodeIds: string[]) => void;

  // Conversations
  loadMockConversations: (agentId: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateConversationStatus: (id: string, status: Conversation['status']) => void;

  // Test Session
  startTestSession: (agentId: string) => void;
  endTestSession: () => void;
  addTestMessage: (role: 'user' | 'agent', content: string) => void;
  setTestTyping: (typing: boolean) => void;

  // DB Variables
  addDbVariable: (variable: Omit<DBVariable, 'id'>) => void;
  updateDbVariable: (id: string, updates: Partial<DBVariable>) => void;
  deleteDbVariable: (id: string) => void;
}

const initDbVariables = (): DBVariable[] =>
  DEFAULT_DB_VARIABLES.map((v) => ({ ...v, id: nanoid() }));

export const useAgentStore = create<AgentLabState & AgentLabActions>((set, get) => ({
  // ─── Initial State ─────────────────────────────────────────────────────────
  agents: [],
  flows: [],
  conversations: [],
  testSession: null,
  dbVariables: initDbVariables(),
  selectedAgentId: null,
  selectedFlowId: null,
  selectedConversationId: null,
  activeModule: 'agents',
  geminiApiKey: '',
  sidebarOpen: true,

  // ─── Navigation ────────────────────────────────────────────────────────────
  setActiveModule: (module) => set({ activeModule: module }),
  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setSelectedFlow: (id) => set({ selectedFlowId: id }),
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),

  // ─── Agents ────────────────────────────────────────────────────────────────
  addAgent: (brandId, overrides = {}) => {
    const agent = createDefaultAgent(brandId, overrides);
    set((s) => ({ agents: [...s.agents, agent] }));
    return agent;
  },

  updateAgent: (id, updates) => {
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },

  deleteAgent: (id) => {
    set((s) => ({
      agents: s.agents.filter((a) => a.id !== id),
      flows: s.flows.filter((f) => f.agentId !== id),
      conversations: s.conversations.filter((c) => c.agentId !== id),
      selectedAgentId: s.selectedAgentId === id ? null : s.selectedAgentId,
    }));
  },

  duplicateAgent: (id) => {
    const original = get().agents.find((a) => a.id === id);
    if (!original) return;
    const now = new Date().toISOString();
    const copy: Agent = {
      ...original,
      id: nanoid(),
      name: `${original.name} (copia)`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      metrics: { totalConversations: 0, activeConversations: 0, avgResponseTime: 0, resolutionRate: 0, handoffRate: 0, satisfactionScore: 0 },
    };
    set((s) => ({ agents: [...s.agents, copy] }));
  },

  // ─── Flows ─────────────────────────────────────────────────────────────────
  addFlow: (agentId) => {
    const flow = createDefaultFlow(agentId);
    set((s) => ({ flows: [...s.flows, flow] }));
    return flow;
  },

  updateFlow: (id, updates) => {
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      ),
    }));
  },

  deleteFlow: (id) => {
    set((s) => ({
      flows: s.flows.filter((f) => f.id !== id),
      agents: s.agents.map((a) => (a.flowId === id ? { ...a, flowId: null } : a)),
    }));
  },

  addFlowNode: (flowId, nodeData) => {
    const node: FlowNode = { ...nodeData, id: nanoid() };
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === flowId
          ? { ...f, nodes: [...f.nodes, node], updatedAt: new Date().toISOString() }
          : f
      ),
    }));
    return node;
  },

  updateFlowNode: (flowId, nodeId, updates) => {
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === flowId
          ? {
              ...f,
              nodes: f.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    }));
  },

  deleteFlowNode: (flowId, nodeId) => {
    set((s) => ({
      flows: s.flows.map((f) =>
        f.id === flowId
          ? {
              ...f,
              nodes: f.nodes
                .filter((n) => n.id !== nodeId)
                .map((n) => ({ ...n, children: n.children.filter((c) => c !== nodeId) })),
              entryNodeId: f.entryNodeId === nodeId ? null : f.entryNodeId,
              updatedAt: new Date().toISOString(),
            }
          : f
      ),
    }));
  },

  reorderFlowNodes: (flowId, nodeIds) => {
    set((s) => ({
      flows: s.flows.map((f) => {
        if (f.id !== flowId) return f;
        const nodeMap = Object.fromEntries(f.nodes.map((n) => [n.id, n]));
        const reordered = nodeIds
          .filter((id) => nodeMap[id])
          .map((id, idx) => ({ ...nodeMap[id], position: idx }));
        return { ...f, nodes: reordered, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  // ─── Conversations ─────────────────────────────────────────────────────────
  loadMockConversations: (agentId) => {
    const existing = get().conversations.filter((c) => c.agentId === agentId);
    if (existing.length > 0) return;
    const mock = createMockConversations(agentId, 5);
    set((s) => ({ conversations: [...s.conversations, ...mock] }));
  },

  addMessage: (conversationId, messageData) => {
    const msg: Message = { ...messageData, id: nanoid(), timestamp: new Date().toISOString() };
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, msg], lastMessageAt: msg.timestamp }
          : c
      ),
    }));
  },

  updateConversationStatus: (id, status) => {
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, status, resolved: status === 'closed' } : c
      ),
    }));
  },

  // ─── Test Session ──────────────────────────────────────────────────────────
  startTestSession: (agentId) => {
    const session: TestSession = {
      agentId,
      messages: [
        {
          id: nanoid(),
          role: 'agent',
          content: '¡Hola! Estoy listo para ser probado. Envíame un mensaje. 🤖',
          timestamp: new Date().toISOString(),
        },
      ],
      isActive: true,
      isTyping: false,
      startedAt: new Date().toISOString(),
    };
    set({ testSession: session });
  },

  endTestSession: () => set({ testSession: null }),

  addTestMessage: (role, content) => {
    const msg: Message = { id: nanoid(), role, content, timestamp: new Date().toISOString() };
    set((s) => ({
      testSession: s.testSession
        ? { ...s.testSession, messages: [...s.testSession.messages, msg] }
        : null,
    }));
  },

  setTestTyping: (typing) => {
    set((s) => ({
      testSession: s.testSession ? { ...s.testSession, isTyping: typing } : null,
    }));
  },

  // ─── DB Variables ──────────────────────────────────────────────────────────
  addDbVariable: (variable) => {
    const v: DBVariable = { ...variable, id: nanoid() };
    set((s) => ({ dbVariables: [...s.dbVariables, v] }));
  },

  updateDbVariable: (id, updates) => {
    set((s) => ({
      dbVariables: s.dbVariables.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  },

  deleteDbVariable: (id) => {
    set((s) => ({ dbVariables: s.dbVariables.filter((v) => v.id !== id) }));
  },
}));
