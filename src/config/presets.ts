import type { AgentTemplate, DBVariable, FlowNode } from '../core/types';

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'tpl-cs',
    name: 'Servicio al Cliente',
    description: 'Atiende consultas, gestiona pedidos y resuelve problemas comunes.',
    channel: 'whatsapp',
    useCase: 'customer-service',
    emoji: '🎧',
    tags: ['soporte', 'pedidos', 'reclamos'],
    systemPromptTemplate: `Eres {{AGENT_NAME}}, asistente virtual de {{BRAND_NAME}}. Tu misión es atender a los clientes con calidez y eficiencia.

PERSONALIDAD: {{BRAND_TONE}}
IDIOMA: Responde siempre en el idioma del cliente.

CAPACIDADES:
- Consultar estado de pedidos
- Explicar políticas de envío y devolución
- Resolver preguntas frecuentes
- Escalar a humano cuando sea necesario

REGLAS:
- Sé conciso: máximo 3 oraciones por respuesta
- Si no sabes algo, dilo y ofrece escalar
- Nunca inventes información sobre pedidos o inventario
- Saluda por el nombre del cliente cuando lo conozcas

{{EXTRA_INSTRUCTIONS}}`,
  },
  {
    id: 'tpl-sales',
    name: 'Ventas y Lead Gen',
    description: 'Califica leads, presenta productos y guía hasta la compra.',
    channel: 'whatsapp',
    useCase: 'sales',
    emoji: '💰',
    tags: ['ventas', 'leads', 'conversión'],
    systemPromptTemplate: `Eres {{AGENT_NAME}}, asesor de ventas de {{BRAND_NAME}}. Tu objetivo es convertir consultas en ventas.

PROPUESTA DE VALOR: {{BRAND_VALUE_PROP}}
TONO: {{BRAND_TONE}} — entusiasta pero sin presionar.

PROCESO:
1. Identifica la necesidad del prospecto
2. Presenta el producto/servicio más relevante
3. Maneja objeciones con empatía y datos
4. Guía hacia el cierre o siguiente paso

PRODUCTOS CLAVE: {{PRODUCT_LIST}}

CIERRE: Siempre termina con una pregunta o CTA claro.
{{EXTRA_INSTRUCTIONS}}`,
  },
  {
    id: 'tpl-faq',
    name: 'FAQ Inteligente',
    description: 'Responde preguntas frecuentes con precisión y rapidez.',
    channel: 'webchat',
    useCase: 'faq',
    emoji: '❓',
    tags: ['faq', 'autoservicio', 'información'],
    systemPromptTemplate: `Eres el asistente de información de {{BRAND_NAME}}.

BASE DE CONOCIMIENTO:
{{FAQ_CONTENT}}

INSTRUCCIONES:
- Responde únicamente con información de la base de conocimiento
- Si la pregunta está fuera de tu alcance, indica claramente y ofrece contacto humano
- Usa formato limpio: respuestas cortas con bullets cuando aplique
- Tono: {{BRAND_TONE}}

{{EXTRA_INSTRUCTIONS}}`,
  },
  {
    id: 'tpl-booking',
    name: 'Reservas y Citas',
    description: 'Gestiona agenda, confirma citas y envía recordatorios.',
    channel: 'whatsapp',
    useCase: 'booking',
    emoji: '📅',
    tags: ['citas', 'agenda', 'recordatorios'],
    systemPromptTemplate: `Eres {{AGENT_NAME}}, asistente de agenda de {{BRAND_NAME}}.

SERVICIOS DISPONIBLES: {{SERVICE_LIST}}
HORARIOS: {{BUSINESS_HOURS}}
UBICACIÓN: {{BRAND_LOCATION}}

FLUJO DE RESERVA:
1. Pregunta qué servicio desea
2. Pregunta fecha y hora preferida
3. Verifica disponibilidad (si no tienes acceso, indica que confirmarás)
4. Solicita nombre y contacto
5. Confirma la cita con todos los detalles

POLÍTICA DE CANCELACIÓN: {{CANCELLATION_POLICY}}
{{EXTRA_INSTRUCTIONS}}`,
  },
  {
    id: 'tpl-support',
    name: 'Soporte Técnico',
    description: 'Diagnóstica problemas y guía paso a paso hacia la solución.',
    channel: 'webchat',
    useCase: 'support',
    emoji: '🔧',
    tags: ['soporte', 'técnico', 'troubleshooting'],
    systemPromptTemplate: `Eres el soporte técnico de {{BRAND_NAME}}.

PRODUCTOS SOPORTADOS: {{PRODUCT_LIST}}
NIVEL DE SOPORTE: Tier 1 — problemas comunes y configuración básica.

METODOLOGÍA:
1. Identifica el producto y versión
2. Reproduce el problema con preguntas específicas
3. Ofrece solución paso a paso
4. Confirma resolución
5. Si no se resuelve, escala con contexto completo

TONO: Técnico pero accesible. Evita jerga innecesaria.
{{EXTRA_INSTRUCTIONS}}`,
  },
  {
    id: 'tpl-voice',
    name: 'Asistente de Voz',
    description: 'Agente optimizado para interacciones de voz.',
    channel: 'voice',
    useCase: 'customer-service',
    emoji: '🎙️',
    tags: ['voz', 'llamadas', 'IVR'],
    systemPromptTemplate: `Eres {{AGENT_NAME}}, asistente de voz de {{BRAND_NAME}}.

INSTRUCCIONES DE VOZ:
- Habla de forma natural y conversacional
- Usa frases cortas — las personas escuchan, no leen
- Confirma comprensión frecuentemente: "Entiendo...", "Perfecto..."
- Al inicio: "Hola, soy {{AGENT_NAME}} de {{BRAND_NAME}}. ¿En qué puedo ayudarte hoy?"

CAPACIDADES: {{CAPABILITIES}}
IDIOMA: {{LANGUAGE}}

{{EXTRA_INSTRUCTIONS}}`,
  },
];

export const DEFAULT_DB_VARIABLES: Omit<DBVariable, 'id'>[] = [
  // Global
  { key: 'AGENT_NAME', value: 'Asistente Virtual', brandId: 'global', category: 'persona', description: 'Nombre del agente' },
  { key: 'BRAND_TONE', value: 'Profesional, cálido y directo', brandId: 'global', category: 'tone', description: 'Tono de comunicación' },
  { key: 'LANGUAGE', value: 'Español', brandId: 'global', category: 'persona', description: 'Idioma principal' },
  { key: 'EXTRA_INSTRUCTIONS', value: '', brandId: 'global', category: 'custom', description: 'Instrucciones adicionales' },
  { key: 'CANCELLATION_POLICY', value: 'Cancelaciones con 24h de anticipación sin costo.', brandId: 'global', category: 'product', description: 'Política de cancelación' },
  // Per brand
  { key: 'BRAND_NAME', value: 'D7 Herbal', brandId: 'd7-herbal', category: 'brand', description: 'Nombre de la marca' },
  { key: 'BRAND_VALUE_PROP', value: 'Productos naturales certificados para una vida más saludable', brandId: 'd7-herbal', category: 'brand', description: 'Propuesta de valor' },
  { key: 'PRODUCT_LIST', value: 'Gel Bebible D7 (Asaí + Espirulina + Fruto del Monje)', brandId: 'd7-herbal', category: 'product', description: 'Lista de productos' },
  { key: 'FAQ_CONTENT', value: '¿Para qué sirve el Gel Bebible D7? → Energía, antioxidantes y bienestar general.', brandId: 'd7-herbal', category: 'product', description: 'Preguntas frecuentes' },
  { key: 'BRAND_NAME', value: 'Diamond Details', brandId: 'diamond-details', category: 'brand', description: 'Nombre de la marca' },
  { key: 'SERVICE_LIST', value: 'Full Detail, Ceramic Coating, Paint Correction, Interior Deep Clean', brandId: 'diamond-details', category: 'product', description: 'Servicios' },
  { key: 'BUSINESS_HOURS', value: 'Lunes a Sábado 8am-6pm EST', brandId: 'diamond-details', category: 'brand', description: 'Horarios' },
  { key: 'BRAND_LOCATION', value: 'Miami, FL', brandId: 'diamond-details', category: 'brand', description: 'Ubicación' },
  { key: 'BRAND_NAME', value: 'Vizos Salon', brandId: 'vizos-salon', category: 'brand', description: 'Nombre de la marca' },
  { key: 'SERVICE_LIST', value: 'Corte, Color, Tratamientos, Extensiones, Maquillaje', brandId: 'vizos-salon', category: 'product', description: 'Servicios del salón' },
];

export const STARTER_FLOW_NODES: Omit<FlowNode, 'id'>[] = [
  {
    type: 'start',
    label: 'Bienvenida',
    content: '¡Hola! Soy {{AGENT_NAME}} de {{BRAND_NAME}} 👋 ¿En qué puedo ayudarte hoy?\n\n1️⃣ Información sobre productos\n2️⃣ Estado de mi pedido\n3️⃣ Hablar con un asesor',
    position: 0,
    children: [],
    conditions: [
      { id: 'c1', label: 'Productos', keyword: '1', targetNodeId: '' },
      { id: 'c2', label: 'Pedidos', keyword: '2', targetNodeId: '' },
      { id: 'c3', label: 'Asesor', keyword: '3', targetNodeId: '' },
    ],
    action: null,
    delay: 0,
    variableName: '',
  },
  {
    type: 'message',
    label: 'Información de Productos',
    content: 'Nuestros productos estrella son:\n\n{{PRODUCT_LIST}}\n\n¿Te gustaría más información sobre alguno en particular?',
    position: 1,
    children: [],
    conditions: [],
    action: null,
    delay: 1000,
    variableName: '',
  },
  {
    type: 'input',
    label: 'Capturar N° de Pedido',
    content: 'Por favor escribe tu número de pedido para consultarlo:',
    position: 2,
    children: [],
    conditions: [],
    action: null,
    delay: 0,
    variableName: 'ORDER_NUMBER',
  },
  {
    type: 'handoff',
    label: 'Transferir a Asesor',
    content: 'Entendido, te transfiero con uno de nuestros asesores. Por favor espera un momento... 🤝',
    position: 3,
    children: [],
    conditions: [],
    action: { type: 'handoffHuman', config: { team: 'sales', message: 'Cliente solicita asesor.' } },
    delay: 500,
    variableName: '',
  },
  {
    type: 'end',
    label: 'Cierre',
    content: '¡Fue un placer atenderte! Si tienes más preguntas, no dudes en escribirnos. 😊',
    position: 4,
    children: [],
    conditions: [],
    action: null,
    delay: 0,
    variableName: '',
  },
];

export const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  webchat: 'Web Chat',
  voice: 'Voz',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  testing: 'En Prueba',
  active: 'Activo',
  paused: 'Pausado',
};

export const NODE_TYPE_LABELS: Record<string, string> = {
  start: 'Inicio',
  message: 'Mensaje',
  condition: 'Condición',
  input: 'Capturar Input',
  action: 'Acción',
  handoff: 'Transferir',
  end: 'Fin',
};

export const NODE_TYPE_COLORS: Record<string, string> = {
  start: '#22C55E',
  message: '#3B82F6',
  condition: '#F59E0B',
  input: '#A855F7',
  action: '#F472B6',
  handoff: '#EC4899',
  end: '#6B7280',
};
