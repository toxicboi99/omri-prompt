import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { promptInclude, type PromptWithRelations } from '@/lib/repositories/content';

export type PromptFilters = { q?: string; category?: string; gender?: string; occasion?: string; location?: string; camera?: string; lighting?: string; aspectRatio?: string; tag?: string; sort?: string; page?: number; limit?: number };

export function promptWhere(filters: PromptFilters = {}): Prisma.PromptWhereInput {
  const q = filters.q?.trim();
  return { status: 'PUBLISHED', ...(filters.category ? { category: { slug: filters.category } } : {}), ...(filters.gender ? { gender: { equals: filters.gender, mode: 'insensitive' } } : {}), ...(filters.occasion ? { occasion: { equals: filters.occasion, mode: 'insensitive' } } : {}), ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}), ...(filters.camera ? { camera: { contains: filters.camera, mode: 'insensitive' } } : {}), ...(filters.lighting ? { lighting: { contains: filters.lighting, mode: 'insensitive' } } : {}), ...(filters.aspectRatio ? { aspectRatio: filters.aspectRatio } : {}), ...(filters.tag ? { tags: { some: { tag: { slug: filters.tag } } } } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { prompt: { contains: q, mode: 'insensitive' } }, { category: { name: { contains: q, mode: 'insensitive' } } }, { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } }, { gender: { contains: q, mode: 'insensitive' } }, { occasion: { contains: q, mode: 'insensitive' } }, { location: { contains: q, mode: 'insensitive' } }, { camera: { contains: q, mode: 'insensitive' } }, { lighting: { contains: q, mode: 'insensitive' } }] } : {}) };
}

export async function findPublishedPrompts(filters: PromptFilters = {}) {
  const page = Math.max(1, Number(filters.page) || 1); const limit = Math.min(48, Math.max(1, Number(filters.limit) || 16)); const where = promptWhere(filters);
  const orderBy: Prisma.PromptOrderByWithRelationInput[] = filters.sort === 'latest' ? [{ createdAt: 'desc' }] : filters.sort === 'views' ? [{ viewCount: 'desc' }, { createdAt: 'desc' }] : filters.sort === 'copied' ? [{ copyCount: 'desc' }, { createdAt: 'desc' }] : [{ isTrending: 'desc' }, { copyCount: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }];
  const [items, total] = await Promise.all([prisma.prompt.findMany({ where, include: promptInclude, orderBy, skip: (page - 1) * limit, take: limit }), prisma.prompt.count({ where })]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function listPublishedPrompts(query?: string) { return (await findPublishedPrompts({ q: query, limit: 48 })).items; }
export async function getPublishedPrompt(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return prisma.prompt.findFirst({ where: { slug: decodedSlug, status: 'PUBLISHED' }, include: promptInclude });
}
export async function getRelatedPrompts(prompt: PromptWithRelations) { return prisma.prompt.findMany({ where: { status: 'PUBLISHED', id: { not: prompt.id }, categoryId: prompt.categoryId }, include: promptInclude, take: 4, orderBy: [{ copyCount: 'desc' }, { createdAt: 'desc' }] }); }
