import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const promptInclude = { category: true, exampleImage: true, tags: { include: { tag: true } } } satisfies Prisma.PromptInclude;
export type PromptWithRelations = Prisma.PromptGetPayload<{ include: typeof promptInclude }>;

export async function getCategories() { return prisma.category.findMany({ where: { status: 'PUBLISHED' }, include: { _count: { select: { prompts: { where: { status: 'PUBLISHED' } } } } }, orderBy: { displayOrder: 'asc' } }); }
export async function getPublishedTools() { return prisma.aITool.findMany({ where: { status: 'PUBLISHED' }, orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }] }); }
export async function getPublishedPosts() { return prisma.blogPost.findMany({ where: { status: 'PUBLISHED' }, include: { category: true }, orderBy: { publishedAt: 'desc' } }); }
export async function trendingPrompts(take = 12) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [rows, fallback] = await Promise.all([
    prisma.prompt.findMany({ where: { status: 'PUBLISHED' }, include: promptInclude, orderBy: [{ copies: { _count: 'desc' } }, { views: { _count: 'desc' } }, { shares: { _count: 'desc' } }, { createdAt: 'desc' }], take }),
    prisma.prompt.findMany({ where: { status: 'PUBLISHED', createdAt: { gte: since } }, include: promptInclude, orderBy: { createdAt: 'desc' }, take: Math.ceil(take / 3) }),
  ]);
  return [...rows, ...fallback.filter((p) => !rows.some((row) => row.id === p.id))].slice(0, take);
}
