import type { Brand, BrandId } from '../core/types';

// CRÍTICO: IDs deben coincidir con PKs canónicos de Supabase
// Antes usaban kebab-case (d7-herbal) — ahora son PascalCase como en todos los labs
export const BRANDS: Brand[] = [
  {
    id: 'UnrealvilleStudio',
    name: 'Unreal>ille Studio',
    color: '#FFAB00',
    description: 'Agencia inhouse — marketing, publicidad y estrategia',
    emoji: '⚡',
  },
  {
    id: 'PatriciaOsorioPersonal',
    name: 'Patricia Osorio Personal',
    color: '#EC4899',
    description: 'Marca personal — coaching y lifestyle',
    emoji: '✨',
  },
  {
    id: 'PatriciaOsorioComunidad',
    name: 'Patricia Osorio Comunidad',
    color: '#A855F7',
    description: 'Comunidad y contenido educativo',
    emoji: '🌸',
  },
  {
    id: 'PatriciaOsorioVizosSalon',
    name: 'Vizos Salon Miami',
    color: '#F59E0B',
    description: 'Salón de belleza premium',
    emoji: '💇',
  },
  {
    id: 'DiamondDetails',
    name: 'Diamond Details',
    color: '#3B82F6',
    description: 'Detailing automotriz de lujo',
    emoji: '💎',
  },
  {
    id: 'D7Herbal',
    name: 'D7 Herbal',
    color: '#22C55E',
    description: 'Productos naturales — gel bebible (Asaí, Espirulina, Monje)',
    emoji: '🌿',
  },
  {
    id: 'VivoseMask',
    name: 'Vivosé Mask',
    color: '#F472B6',
    description: 'Mascarillas y skincare',
    emoji: '🧖',
  },
  {
    id: 'VizosCosmetics',
    name: 'Vizos Cosmetics',
    color: '#6366F1',
    description: 'Línea de cosméticos profesionales',
    emoji: '💄',
  },
  {
    id: 'ForumPHs',
    name: 'ForumPHs',
    color: '#14B8A6',
    description: 'Administración de propiedades horizontales — Panamá',
    emoji: '🏢',
  },
  {
    id: 'NeuroneSCF',
    name: 'Neurone South & Central Florida',
    color: '#0076A8',
    description: 'Distribución exclusiva Neurone Cosmética — South & Central Florida',
    emoji: '🧬',
  },
];

export const BRAND_MAP: Record<BrandId, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.id, b])
) as Record<BrandId, Brand>;

export const getBrand = (id: BrandId): Brand => BRAND_MAP[id] ?? BRANDS[0];
