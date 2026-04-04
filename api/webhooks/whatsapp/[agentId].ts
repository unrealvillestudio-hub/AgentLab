/**
 * api/webhooks/whatsapp/[agentId].ts
 * Vercel serverless — WhatsApp webhook per agent.
 *
 * Handles:
 *   GET  → webhook verification (Meta challenge)
 *   POST → incoming messages → Claude response → WhatsApp reply
 *
 * Env vars required per agent (set in Vercel):
 *   ANTHROPIC_API_KEY
 *   SUPABASE_URL  (server-side, not VITE_)
 *   SUPABASE_SERVICE_KEY
 *   WA_ACCESS_TOKEN_[AGENTID]  — Meta access token per agent
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// ---------------------------------------------------------------------------
// SUPABASE — fetch agent system prompt
// ---------------------------------------------------------------------------

async function getAgentConfig(agentId: string): Promise<{
  systemPrompt: string;
  brandId: string;
  name: string;
} | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const res = await fetch(
    `${url}/rest/v1/agents?id=eq.${encodeURIComponent(agentId)}&select=name,brand_id,system_prompt&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) return null;
  return {
    systemPrompt: rows[0].system_prompt ?? '',
    brandId:      rows[0].brand_id,
    name:         rows[0].name,
  };
}

// ---------------------------------------------------------------------------
// WHATSAPP — send reply
// ---------------------------------------------------------------------------

async function sendWhatsAppReply(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<void> {
  await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    }
  );
}

// ---------------------------------------------------------------------------
// HANDLER
// ---------------------------------------------------------------------------

export default async function handler(req: any, res: any) {
  const { agentId } = req.query;

  // ── GET: Meta webhook verification ──────────────────────────────────────
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // verify_token is stored per-agent as WA_VERIFY_TOKEN_[AGENTID]
    const expectedToken = process.env[`WA_VERIFY_TOKEN_${agentId?.toUpperCase()}`] || '';

    if (mode === 'subscribe' && token === expectedToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ── POST: incoming message ───────────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;

    // Extract message from Meta webhook payload
    const entry    = body?.entry?.[0];
    const change   = entry?.changes?.[0];
    const value    = change?.value;
    const messages = value?.messages;

    if (!messages?.length) return res.status(200).json({ ok: true }); // ack non-message events

    const msg  = messages[0];
    const from = msg.from; // sender phone number
    const text = msg.type === 'text' ? msg.text?.body : null;

    if (!text) return res.status(200).json({ ok: true }); // ignore non-text for now

    // Fetch agent config from Supabase
    const agent = await getAgentConfig(agentId as string);
    if (!agent) {
      console.error(`[WhatsApp webhook] Agent not found: ${agentId}`);
      return res.status(200).json({ ok: true }); // always 200 to Meta
    }

    // Generate response with Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: agent.systemPrompt || `Eres ${agent.name}, un asistente virtual útil y profesional.`,
      messages: [{ role: 'user', content: text }],
    });

    const reply = message.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('');

    // Send reply via WhatsApp
    const phoneNumberId = value?.metadata?.phone_number_id;
    const accessToken   = process.env[`WA_ACCESS_TOKEN_${agentId?.toUpperCase()}`] || '';

    if (phoneNumberId && accessToken && reply) {
      await sendWhatsAppReply(phoneNumberId, accessToken, from, reply);
    }

    return res.status(200).json({ ok: true });

  } catch (err: any) {
    console.error('[WhatsApp webhook] Error:', err);
    return res.status(200).json({ ok: true }); // always 200 to Meta — never retry
  }
}
