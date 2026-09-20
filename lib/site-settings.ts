import { prisma } from '@/lib/prisma';

export type HeroSettings = {
  title: string; subtitle: string; searchPlaceholder: string; primaryCtaText: string;
  primaryCtaUrl: string; secondaryCtaText: string; secondaryCtaUrl: string; imageUrl: string;
  overlayOpacity: number; alignment: 'left' | 'center'; enabled: boolean;
};

export const defaultHero: HeroSettings = {
  title: 'AI Photo Prompts', subtitle: 'Discover ready-to-use AI photo prompts. Copy a prompt and create amazing images with your favorite AI image generator.',
  searchPlaceholder: 'Search AI photo prompts...', primaryCtaText: 'Explore prompts', primaryCtaUrl: '/prompts',
  secondaryCtaText: 'Browse prompts', secondaryCtaUrl: '/prompts', imageUrl: '', overlayOpacity: 35, alignment: 'left', enabled: true,
};

export async function getHeroSettings(): Promise<HeroSettings> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'homepage.hero' } });
  if (!setting) return defaultHero;
  try { return { ...defaultHero, ...JSON.parse(setting.value) }; } catch { return defaultHero; }
}
