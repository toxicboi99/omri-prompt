import { notFound } from 'next/navigation';
import { PageIntro } from '@/components/common/page-intro';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { prisma } from '@/lib/prisma';
import { findPublishedPrompts } from '@/lib/repositories/prompts';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const style = await prisma.style.findUnique({ where: { slug: (await params).slug } }); return { title: style?.seoTitle ?? `${style?.name ?? 'Style'} AI Photo Prompts | OMRI Prompt`, description: style?.seoDescription ?? style?.description }; }
export default async function Style({ params }: { params: Promise<{ slug: string }> }) { const slug = (await params).slug; const [style, prompts] = await Promise.all([prisma.style.findFirst({ where: { slug, status: 'PUBLISHED' } }), findPublishedPrompts({ style: slug, limit: 24 })]); if (!style) notFound(); return <PageIntro eyebrow="AI PHOTO STYLE" title={`${style.name} AI Photo Prompts`} description={style.description}><PromptGrid items={prompts.items}/></PageIntro>; }
