import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '../../store/agentStore';
import { getBrand } from '../../config/brands';
import {
  Button, Card, Input, SectionHeader, EmptyState,
  Badge, CodeBlock, CopyButton, Toggle, Divider,
} from '../../ui/components';
import { buildWhatsAppWebhookUrl } from '../../services/agentEngine';

export function WhatsAppIntegration() {
  const { agents, selectedAgentId, updateAgent } = useAgentStore();
  const waAgents = agents.filter((a) => a.channel === 'whatsapp');
  const agent = waAgents.find((a) => a.id === selectedAgentId) ?? waAgents[0] ?? null;

  const [config, setConfig] = useState(agent?.whatsappConfig ?? null);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!agent || !config) {
    return (
      <div className="p-6">
        <EmptyState
          icon="💬"
          title="Sin agentes WhatsApp"
          description="Crea un agente con canal WhatsApp para configurar la integración con Meta."
        />
      </div>
    );
  }

  const brand = getBrand(agent.brandId);
  const webhookUrl = buildWhatsAppWebhookUrl(agent.id);

  const handleSave = () => {
    updateAgent(agent.id, {
      whatsappConfig: { ...config, webhookUrl },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 1800));
    setTestResult(config.phoneNumberId && config.accessToken ? 'success' : 'error');
    if (config.phoneNumberId && config.accessToken) {
      updateAgent(agent.id, { whatsappConfig: { ...config, connected: true, webhookUrl } });
    }
    setTesting(false);
  };

  const handleToggleConnected = (val: boolean) => {
    const updated = { ...config, connected: val };
    setConfig(updated);
    updateAgent(agent.id, { whatsappConfig: { ...updated, webhookUrl } });
  };

  return (
    <div className="p-6 max-w-4xl">
      <SectionHeader
        title="WhatsApp Business"
        subtitle="Integración con Meta Cloud API"
        accent={brand.color}
        action={
          <div className="flex items-center gap-3">
            <Toggle
              checked={config.connected}
              onChange={handleToggleConnected}
              label={config.connected ? 'Conectado' : 'Desconectado'}
            />
          </div>
        }
      />

      {/* Agent selector */}
      {waAgents.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {waAgents.map((a) => {
            const b = getBrand(a.brandId);
            return (
              <button
                key={a.id}
                onClick={() => {
                  useAgentStore.getState().setSelectedAgent(a.id);
                  setConfig(a.whatsappConfig);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                  a.id === agent.id
                    ? 'bg-[#FFAB00]/10 border-[#FFAB00]/40 text-white'
                    : 'bg-white/4 border-white/8 text-white/60 hover:bg-white/6'
                }`}
              >
                <span>{b.emoji}</span>
                <span>{a.name}</span>
                {a.whatsappConfig.connected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Form */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              🔑 Credenciales Meta Business
            </h3>
            <div className="space-y-4">
              <Input
                label="Phone Number ID"
                placeholder="123456789012345"
                value={config.phoneNumberId}
                onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
                hint="ID del número de teléfono en Meta Business Manager"
              />
              <div className="relative">
                <Input
                  label="Access Token"
                  placeholder="EAABwzLixnjY..."
                  value={config.accessToken}
                  type="password"
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  hint="Token de acceso del sistema (permanente recomendado)"
                />
              </div>
              <Input
                label="Business Account ID"
                placeholder="987654321098765"
                value={config.businessAccountId}
                onChange={(e) => setConfig({ ...config, businessAccountId: e.target.value })}
              />
              <Input
                label="Webhook Verify Token"
                value={config.webhookVerifyToken}
                onChange={(e) => setConfig({ ...config, webhookVerifyToken: e.target.value })}
                hint="Token para verificar el webhook con Meta"
              />
            </div>

            <Divider className="my-4" />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                loading={testing}
                className="flex-1"
              >
                {testing ? 'Probando...' : '🔌 Probar Conexión'}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="flex-1"
              >
                {saved ? '✓ Guardado' : '💾 Guardar'}
              </Button>
            </div>

            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 p-3 rounded-xl text-sm ${
                  testResult === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {testResult === 'success'
                  ? '✅ Conexión exitosa — agente listo para recibir mensajes'
                  : '❌ Error de conexión — verifica las credenciales'}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Webhook & Setup */}
        <div className="space-y-4">
          {/* Webhook URL */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              🌐 Configuración del Webhook
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 block mb-1">URL del Webhook</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5 border border-white/8">
                  <span className="text-xs font-mono text-white/70 flex-1 break-all">{webhookUrl}</span>
                  <CopyButton text={webhookUrl} />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Verify Token</label>
                <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5 border border-white/8">
                  <span className="text-xs font-mono text-white/70 flex-1">{config.webhookVerifyToken}</span>
                  <CopyButton text={config.webhookVerifyToken} />
                </div>
              </div>
            </div>

            <Divider className="my-4" />

            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Campos requeridos en Meta</p>
              {['messages', 'message_deliveries', 'message_reads'].map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-white/60">{field}</span>
                  <Badge variant="success">✓ Requerido</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Setup Guide */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              📋 Guía de Configuración
            </h3>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Crear app en Meta for Developers', desc: 'Tipo: Business. Agrega el producto WhatsApp.' },
                { step: '2', title: 'Obtener Phone Number ID', desc: 'En WhatsApp → Getting Started. Copia el Phone Number ID.' },
                { step: '3', title: 'Generar Access Token', desc: 'Crea un System User con permisos whatsapp_business_messaging.' },
                { step: '4', title: 'Configurar Webhook', desc: 'Pega el URL y Verify Token de arriba en Meta Webhooks.' },
                { step: '5', title: 'Suscribir al número', desc: 'En WhatsApp → Configuration, suscribe el número al webhook.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FFAB00]/20 text-[#FFAB00] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Test Message */}
          <Card className="p-5">
            <h3 className="font-semibold text-white mb-3">📨 Payload de Prueba</h3>
            <CodeBlock
              language="json"
              code={JSON.stringify({
                messaging_product: "whatsapp",
                to: "{{PHONE_NUMBER}}",
                type: "text",
                text: { body: "¡Hola! Mensaje de prueba desde UNRLVL AgentLab." }
              }, null, 2)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
