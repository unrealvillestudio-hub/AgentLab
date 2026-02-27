import type { Brand, BrandId } from '../core/types';

export const BRANDS: Brand[] = [
  {
    id: 'unrealille-studio',
    name: 'UnrealIlle Studio',
    color: '#FFAB00',
    description: 'Agencia inhouse — marketing, publicidad y estrategia',
    emoji: '⚡',
  },
  {
    id: 'patricia-personal',
    name: 'Patricia Osorio Personal',
    color: '#EC4899',
    description: 'Marca personal — coaching y lifestyle',
    emoji: '✨',
  },
  {
    id: 'patricia-comunidad',
    name: 'Patricia Osorio Comunidad',
    color: '#A855F7',
    description: 'Comunidad y contenido educativo',
    emoji: '🌸',
  },
  {
    id: 'vizos-salon',
    name: 'Vizos Salon',
    color: '#F59E0B',
    description: 'Salón de belleza premium',
    emoji: '💇',
  },
  {
    id: 'diamond-details',
    name: 'Diamond Details',
    color: '#3B82F6',
    description: 'Detailing automotriz de lujo',
    emoji: '💎',
  },
  {
    id: 'd7-herbal',
    name: 'D7 Herbal',
    color: '#22C55E',
    description: 'Productos naturales — gel bebible (Asaí, Espirulina, Monje)',
    emoji: '🌿',
  },
  {
    id: 'vivose-mask',
    name: 'Vivose Mask',
    color: '#F472B6',
    description: 'Mascarillas y skincare',
    emoji: '🧖',
  },
  {
    id: 'vizos-cosmetics',
    name: 'Vizos Cosmetics',
    color: '#6366F1',
    description: 'Línea de cosméticos',
    emoji: '💄',
  },
  {
    id: 'phas',
    name: 'PHAS',
    color: '#14B8A6',
    description: 'Patricia Hair & Skin',
    emoji: '🌊',
  },
];

export const BRAND_MAP: Record<BrandId, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.id, b])
) as Record<BrandId, Brand>;

export const getBrand = (id: BrandId): Brand => BRAND_MAP[id] ?? BRANDS[0];
