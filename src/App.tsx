import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from './store/agentStore';
import { getBrand, BRANDS } from './config/brands';
import { CHANNEL_LABELS, STATUS_LABELS } from './config/presets';
import { AgentBuilder } from './modules/AgentBuilder';
import { FlowBuilder } from './modules/FlowBuilder';
import { WhatsAppIntegration } from './modules/WhatsAppIntegration';
import { PromptManager } from './modules/PromptManager';
import { ConversationMonitor } from './modules/ConversationMonitor';
import { TestMode } from './modules/TestMode';
import { BlueprintLibrary } from './modules/BlueprintLibrary';
import { BlueprintDrawer, BlueprintTriggerButton } from './components/BlueprintDrawer';
import type { ModuleView } from './core/types';
import { BUILD_TAG } from './config/buildTag';

const NAV_ITEMS: { id: ModuleView; label: string; icon: string; description: string }[] = [
  { id: 'agents', label: 'Agentes', icon: '🤖', description: 'Crear y gestionar agentes' },
  { id: 'flow', label: 'Flow Builder', icon: '🔀', description: 'Flujos conversacionales' },
  { id: 'prompts', label: 'Prompts', icon: '📝', description: 'System prompts + DB Vars' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', description: 'Meta Cloud API' },
  { id: 'monitor', label: 'Monitor', icon: '📊', description: 'Conversaciones en vivo' },
  { id: 'test', label: 'Test Mode', icon: '🧪', description: 'Simular agente' },
  { id: 'blueprints', label: 'Blueprint Library', icon: '🗂', description: 'Gestionar y asignar BPs' },
];

export function App() {
  const { activeModule, setActiveModule, agents, sidebarOpen, setSidebarOpen, selectedAgentId } = useAgentStore();
  const [resetKey, setResetKey] = useState(0);
  const [bpDrawerOpen, setBpDrawerOpen] = useState(false);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const brand = selectedAgent ? getBrand(selectedAgent.brandId) : null;

  const handleReset = () => setResetKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex font-body">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 220 : 56 }}
        className="flex-shrink-0 bg-[#08080e] border-r border-white/6 flex flex-col h-screen sticky top-0 overflow-hidden"
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-white/6">
          <div className="w-7 h-7 bg-[#FFAB00] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-[#050508] font-bold text-sm leading-none">A</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="font-display text-sm font-bold text-white leading-tight">AgentLab</p>
                <p className="text-xs text-white/30">{BUILD_TAG} — UNRLVL</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-[#FFAB00]/12 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <div className="absolute left-0 w-0.5 h-6 bg-[#FFAB00] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Agent */}
        {selectedAgent && brand && sidebarOpen && (
          <div className="mx-2 mb-3 p-3 rounded-xl border" style={{ borderColor: `${brand.color}30`, backgroundColor: `${brand.color}08` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{brand.emoji}</span>
              <span className="text-xs font-semibold text-white truncate">{selectedAgent.name}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-white/50">
                {CHANNEL_LABELS[selectedAgent.channel]}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${brand.color}15`, color: brand.color }}
              >
                {STATUS_LABELS[selectedAgent.status]}
              </span>
            </div>
          </div>
        )}

        {/* Stats & Toggle */}
        <div className="px-3 pb-4 border-t border-white/6 pt-3">
          {sidebarOpen && (
            <div className="flex justify-between text-xs text-white/30 mb-3">
              <span>{agents.length} agentes</span>
              <span>{agents.filter((a) => a.status === 'active').length} activos</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/6 transition-all"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-[#050508]/90 backdrop-blur-md border-b border-white/6 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{NAV_ITEMS.find((n) => n.id === activeModule)?.icon}</span>
            <div>
              <h1 className="font-display text-base font-semibold text-white">
                {NAV_ITEMS.find((n) => n.id === activeModule)?.label}
              </h1>
              <p className="text-xs text-white/40">
                {NAV_ITEMS.find((n) => n.id === activeModule)?.description}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Blueprint Drawer Trigger — siempre visible */}
            <BlueprintTriggerButton onClick={() => setBpDrawerOpen(true)} />

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Limpiar formulario"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/6 border border-white/8 hover:border-white/15 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Reset
            </button>

            {/* Brand quick-select */}
            <select
              className="bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#FFAB00]/50 transition-all [&>option]:bg-[#0d0d14] [&>option]:text-white"
              value={selectedAgent?.brandId ?? ''}
              onChange={(e) => {
                const a = agents.find((ag) => ag.brandId === e.target.value);
                if (a) useAgentStore.getState().setSelectedAgent(a.id);
              }}
            >
              <option value="">Sin agente activo</option>
              {agents.map((a) => {
                const b = getBrand(a.brandId);
                return (
                  <option key={a.id} value={a.brandId}>
                    {b.emoji} {a.name}
                  </option>
                );
              })}
            </select>

            {/* Brand dots */}
            <div className="flex gap-1">
              {BRANDS.slice(0, 5).map((b) => {
                const hasAgents = agents.some((a) => a.brandId === b.id);
                return (
                  <div
                    key={b.id}
                    className={`w-2 h-2 rounded-full transition-all ${hasAgents ? 'opacity-100' : 'opacity-20'}`}
                    style={{ backgroundColor: b.color }}
                    title={b.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Module Content — key={`${activeModule}-${resetKey}`} fuerza remount en reset */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeModule}-${resetKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeModule === 'agents' && <AgentBuilder />}
            {activeModule === 'flow' && <FlowBuilder />}
            {activeModule === 'prompts' && <PromptManager />}
            {activeModule === 'whatsapp' && <WhatsAppIntegration />}
            {activeModule === 'monitor' && <ConversationMonitor />}
            {activeModule === 'test' && <TestMode />}
            {activeModule === 'blueprints' && <BlueprintLibrary />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Blueprint Drawer — global, accesible desde cualquier módulo */}
      <BlueprintDrawer open={bpDrawerOpen} onClose={() => setBpDrawerOpen(false)} />
    </div>
  );
}

export default App;
