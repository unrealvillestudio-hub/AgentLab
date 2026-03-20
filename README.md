# UNRLVL AgentLab — Unreal>ille Studio

Suite orquestadora de Labs AI del ecosistema Unreal>ille Studio.
App React/TypeScript con todos los Labs integrados localmente.

**Live:** [https://unrlvl-agent-lab.vercel.app](https://unrlvl-agent-lab.vercel.app)
**Contexto completo del ecosistema:** [`CoreProject/CONTEXT.md`](https://github.com/unrealvillestudio-hub/CoreProject/blob/main/CONTEXT.md)

---

## Rol en el ecosistema

AgentLab es la vista consolidada del ecosistema — todos los Labs en una sola app. Mientras cada Lab vive en AI Studio de forma independiente, AgentLab los orquesta localmente y sirve como entorno de pruebas para flujos multi-Lab. Es también donde vive el Orchestrator (planner de flujos).

```
AgentLab (orquestador local)
├── WebLab
├── BlogLab
├── CopyLab
├── SocialLab
├── VideoLab
├── ImageLab (en desarrollo)
├── VoiceLab (en desarrollo)
├── BlueprintLab
└── Orchestrator (planner multi-Lab)
```

---

## Stack

- React 18 + TypeScript + Vite + Tailwind
- AI: Gemini 2.0 Flash (Gemini API)
- State: Zustand
- Deploy: Vercel

---

## Labs incluidos

| Lab | Descripción | Estado |
|-----|-------------|--------|
| WebLab | Generador web HTML/Liquid | ✅ v2.6 |
| BlogLab | Posts educativo/SEO/producto/UGC | ✅ v1.0 |
| CopyLab | Ads, emails, captions | ✅ v1.1 |
| SocialLab | Copy + scheduling redes sociales | ✅ v1.1 |
| VideoLab | Storyboards y guiones | ✅ v1.1 |
| ImageLab | Prompt packs para imagen | 🟡 En desarrollo |
| VoiceLab | Scripts de voz y audio | 🟡 En desarrollo |
| BlueprintLab | Creación y validación de BPs | ✅ v1.2 |
| Orchestrator | Planner de flujos multi-Lab | ✅ v1.1 |

---

## Capas transversales

### Humanize Layer (F2.5)
Todo output del ecosistema debe sentirse hecho por humanos para humanos.
- **Fuente:** `src/config/humanizeConfig.ts`
- **Fallback chain:** `BP_PERSON.humanize.[medio]` → `BRAND_HUMANIZE_OVERRIDES[brandId]` → `HUMANIZE_DEFAULTS`

### DB_VARIABLES
Fuente de verdad para tokens de marca, personas, contextos y CTAs.
Versión actual: **v6.4** — `CoreProject/DB_VARIABLES_v6.xlsx`

---

## Marcas activas

| ID | Marca | Mercado |
|----|-------|---------|
| `neuroneCosmetics` | Neurone Cosmética | Miami B2C + B2B profesional |
| `patriciaOsorioVizosSalon` | Vizos Salón | Miami / South Dade |
| `vizosCosmetics` | Vizos Cosmetics | Miami |
| `diamondDetails` | Diamond Details | Miami auto detailing |
| `d7Herbal` | D7Herbal | Miami / exportación |
| `forumPhs` | ForumPHs | Panamá — Admin. Propiedad Horizontal |

---

## Dependencias

| Consume | Provee |
|---------|--------|
| BluePrints (todos los BP schemas) | Orquestación de flujos |
| DB_VARIABLES_v6 | Entorno integrado de todos los Labs |
| CoreProject/CONTEXT.md | — |

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local  # añade VITE_GEMINI_API_KEY
npm run dev
```

---

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-03-20 | README actualizado · ForumPHs añadido a marcas activas |
| — | Orchestrator v1.1 |
| — | Suite completa con 9 Labs |
