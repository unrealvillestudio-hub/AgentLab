/// <reference types="vite/client" />
/**
 * agentLabLoader.ts
 * Supabase persistence for AgentLab Builder.
 * Replaces Zustand in-memory store for agents and flows.
 *
 * Tables: agents, agent_flows, agent_deployments_config
 */

import type { Agent, ConversationFlow } from '../core/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY     = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ---------------------------------------------------------------------------
// RAW FETCH
// ---------------------------------------------------------------------------

async function sbGet(table: string, params: string): Promise<any[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`[AgentLabLoader] GET ${table} failed: ${res.status}`);
  return res.json();
}

async function sbUpsert(table: string, body: object): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[AgentLabLoader] UPSERT ${table} failed: ${res.status} — ${err}`);
  }
}

async function sbDelete(table: string, id: string): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    }
  );
  if (!res.ok) throw new Error(`[AgentLabLoader] DELETE ${table} failed: ${res.status}`);
}

// ---------------------------------------------------------------------------
// CANONICAL BRAND ID MAP (same pattern as socialLabLoader)
// AgentLab uses kebab-case; Supabase uses PascalCase
// ---------------------------------------------------------------------------

const LOCAL_TO_CANONICAL: Record<string, string> = {
  'unrealille-studio':      'UnrealvilleStudio',
  'patricia-personal':      'PatriciaOsorioPersonal',
  'patricia-comunidad':     'PatriciaOsorioComunidad',
  'vizos-salon':            'PatriciaOsorioVizosSalon',
  'diamond-details':        'DiamondDetails',
  'd7-herbal':              'D7Herbal',
  'vivose-mask':            'VivoseMask',
  'vizos-cosmetics':        'VizosCosmetics',
  'phas':                   'ForumPHs',
  'neurone-cosmetics':      'NeuroneSCF',
  // Already canonical — pass-through
  'UnrealvilleStudio':      'UnrealvilleStudio',
  'PatriciaOsorioPersonal': 'PatriciaOsorioPersonal',
  'PatriciaOsorioComunidad':'PatriciaOsorioComunidad',
  'PatriciaOsorioVizosSalon':'PatriciaOsorioVizosSalon',
  'DiamondDetails':         'DiamondDetails',
  'D7Herbal':               'D7Herbal',
  'VivoseMask':             'VivoseMask',
  'VizosCosmetics':         'VizosCosmetics',
  'ForumPHs':               'ForumPHs',
  'NeuroneSCF':             'NeuroneSCF',
};

export function toCanonicalBrandId(localId: string): string {
  return LOCAL_TO_CANONICAL[localId] ?? localId;
}

// ---------------------------------------------------------------------------
// MAPPERS — Supabase row → app types
// ---------------------------------------------------------------------------

function rowToAgent(row: any): Agent {
  return {
    id: row.id,
    brandId: row.brand_id as Agent['brandId'],
    name: row.name,
    description: row.description ?? '',
    channel: row.channel,
    status: row.status,
    systemPrompt: row.system_prompt ?? '',
    flowId: row.flow_id ?? null,
    language: row.language ?? 'es',
    tags: row.tags ?? [],
    whatsappConfig: {
      phoneNumberId:       row.wa_phone_number_id ?? '',
      accessToken:         '',   // never stored in DB — env var per deployment
      webhookVerifyToken:  row.wa_webhook_verify_token ?? '',
      businessAccountId:   row.wa_business_account_id ?? '',
      connected:           row.wa_connected ?? false,
      webhookUrl:          row.wa_webhook_url ?? '',
    },
    webChatConfig: {
      widgetTitle:     row.wc_widget_title ?? 'Chat con nosotros',
      welcomeMessage:  row.wc_welcome_message ?? '¡Hola! ¿En qué podemos ayudarte?',
      primaryColor:    row.wc_primary_color ?? '#FFAB00',
      position:        row.wc_position ?? 'bottom-right',
      embedCode:       row.wa_webhook_url
        ? generateEmbedCode(row.id, row.wc_primary_color, row.wc_widget_title, row.wc_position)
        : '',
    },
    voiceConfig: {
      voiceId:      row.voice_id ?? '',
      language:     row.voice_language ?? 'es-ES',
      provider:     row.voice_provider ?? 'elevenlabs',
      phoneNumber:  row.voice_phone_number ?? '',
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metrics: {
      totalConversations:  row.total_conversations ?? 0,
      activeConversations: row.active_conversations ?? 0,
      avgResponseTime:     row.avg_response_time ?? 0,
      resolutionRate:      row.resolution_rate ?? 0,
      handoffRate:         0,
      satisfactionScore:   0,
    },
  };
}

function agentToRow(agent: Agent): object {
  return {
    id:                     agent.id,
    brand_id:               toCanonicalBrandId(agent.brandId),
    name:                   agent.name,
    description:            agent.description,
    channel:                agent.channel,
    status:                 agent.status,
    system_prompt:          agent.systemPrompt,
    flow_id:                agent.flowId,
    language:               agent.language,
    tags:                   agent.tags,
    wa_phone_number_id:     agent.whatsappConfig?.phoneNumberId || null,
    wa_business_account_id: agent.whatsappConfig?.businessAccountId || null,
    wa_webhook_verify_token:agent.whatsappConfig?.webhookVerifyToken || null,
    wa_webhook_url:         agent.whatsappConfig?.webhookUrl || null,
    wa_connected:           agent.whatsappConfig?.connected ?? false,
    wc_widget_title:        agent.webChatConfig?.widgetTitle || null,
    wc_welcome_message:     agent.webChatConfig?.welcomeMessage || null,
    wc_primary_color:       agent.webChatConfig?.primaryColor || null,
    wc_position:            agent.webChatConfig?.position || null,
    voice_id:               agent.voiceConfig?.voiceId || null,
    voice_language:         agent.voiceConfig?.language || null,
    voice_provider:         agent.voiceConfig?.provider || null,
    voice_phone_number:     agent.voiceConfig?.phoneNumber || null,
  };
}

function rowToFlow(row: any): ConversationFlow {
  return {
    id:           row.id,
    agentId:      row.agent_id,
    name:         row.name,
    description:  row.description ?? '',
    nodes:        row.nodes ?? [],
    entryNodeId:  row.entry_node_id ?? null,
    createdAt:    row.created_at,
    updatedAt:    row.updated_at,
  };
}

function flowToRow(flow: ConversationFlow): object {
  return {
    id:             flow.id,
    agent_id:       flow.agentId,
    name:           flow.name,
    description:    flow.description,
    nodes:          flow.nodes,
    entry_node_id:  flow.entryNodeId,
  };
}

// ---------------------------------------------------------------------------
// EMBED CODE GENERATOR — real Vercel URL
// ---------------------------------------------------------------------------

export function generateEmbedCode(
  agentId: string,
  primaryColor = '#FFAB00',
  widgetTitle = 'Chat con nosotros',
  position = 'bottom-right'
): string {
  // Points to the AgentLab webchat endpoint — real URL
  return `<!-- UNRLVL AgentLab WebChat -->
<script>
  window.UNRLVL_CHAT_CONFIG = {
    agentId: "${agentId}",
    title: "${widgetTitle}",
    primaryColor: "${primaryColor}",
    position: "${position}",
    endpoint: "https://unrlvl-agent-lab.vercel.app/api/chat"
  };
</script>
<script src="https://unrlvl-agent-lab.vercel.app/webchat.js" async></script>`;
}

export function buildWhatsAppWebhookUrl(agentId: string): string {
  return `https://unrlvl-agent-lab.vercel.app/api/webhooks/whatsapp/${agentId}`;
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

export async function loadAgents(): Promise<Agent[]> {
  const rows = await sbGet('agents', 'select=*&active=eq.true&order=created_at.asc');
  return rows.map(rowToAgent);
}

export async function loadFlows(): Promise<ConversationFlow[]> {
  const rows = await sbGet('agent_flows', 'select=*&active=eq.true&order=created_at.asc');
  return rows.map(rowToFlow);
}

export async function upsertAgent(agent: Agent): Promise<void> {
  await sbUpsert('agents', agentToRow(agent));
}

export async function upsertFlow(flow: ConversationFlow): Promise<void> {
  await sbUpsert('agent_flows', flowToRow(flow));
}

export async function deleteAgent(agentId: string): Promise<void> {
  await sbDelete('agents', agentId);
}

export async function deleteFlow(flowId: string): Promise<void> {
  await sbDelete('agent_flows', flowId);
}

// ---------------------------------------------------------------------------
// FALLBACK
// ---------------------------------------------------------------------------

export const FALLBACK_AGENTS: Agent[] = [];
export const FALLBACK_FLOWS: ConversationFlow[] = [];
