import { notFound } from 'next/navigation';
import { PageIntro } from '@/components/common/page-intro';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { prisma } from '@/lib/prisma';
import { findPublishedPrompts } from '@/lib/repositories/prompts';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const category = await prisma.category.findUnique({ where: { slug: (await params).slug } }); return { title: category?.seoTitle ?? `${category?.name ?? 'Category'} AI Photo Prompts | OMRI Prompt`, description: category?.seoDescription ?? category?.description }; }
export default async function Category({ params }: { params: Promise<{ slug: string }> }) { const slug = (await params).slug; const [category, prompts] = await Promise.all([prisma.category.findFirst({ where: { slug, status: 'PUBLISHED' } }), findPublishedPrompts({ category: slug, limit: 24 })]); if (!category) notFound(); return <PageIntro eyebrow="PROMPT CATEGORY" title={`AI Photo Prompts for ${category.name}`} description={category.description}><PromptGrid items={prompts.items}/></PageIntro>; }
