import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CopyPromptButton } from '@/components/prompts/copy-prompt-button';
import { SiteFooter, SiteHeader } from '@/components/common/site-chrome';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { getRelatedPrompts, getPublishedPrompt } from '@/lib/repositories/prompts';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const prompt = await getPublishedPrompt((await params).slug);
  if (!prompt) return { title: 'Prompt not found | OMRI Prompt' };
  return {
    title: prompt.seoTitle ?? `${prompt.title} | OMRI Prompt`,
    description: prompt.seoDescription ?? prompt.description,
    alternates: { canonical: `/prompts/${prompt.slug}` },
    openGraph: { title: prompt.title, description: prompt.description, images: prompt.exampleImage?.url ? [prompt.exampleImage.url] : [] },
  };
}

export default async function PromptDetail({ params }: { params: Promise<{ slug: string }> }) {
  const prompt = await getPublishedPrompt((await params).slug);
  if (!prompt) notFound();

  const related = await getRelatedPrompts(prompt);
  const metadata = [
    ['Category', prompt.category.name],
    ['Style', prompt.style.name],
    ['Camera', prompt.camera],
    ['Lighting', prompt.lighting],
    ['Aspect ratio', prompt.aspectRatio],
    ['Location', prompt.location],
    ['Mood', prompt.mood],
    ['Clothing', prompt.clothing],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <>
      <SiteHeader />
      <main className="detail-page">
        <p className="breadcrumbs">
          <Link href="/">Home</Link> / <Link href="/prompts">Prompts</Link> / <Link href={`/category/${prompt.category.slug}`}>{prompt.category.name}</Link>
        </p>

        <div className="detail-layout">
          <div className="detail-image" style={prompt.exampleImage?.url ? { backgroundImage: `url(${prompt.exampleImage.url})` } : undefined} />

          <div className="detail-copy">
            <span className="eyebrow">{prompt.style.name.toUpperCase()} PROMPT</span>
            <h1>{prompt.title}</h1>
            <p className="detail-description">{prompt.description}</p>

            <div className="prompt-box">
              <code>{prompt.prompt}</code>
            </div>

            <div className="detail-actions">
              <CopyPromptButton prompt={prompt.prompt} slug={prompt.slug} />
              <Link href={`/search?category=${prompt.category.slug}`} className="secondary-action">View similar</Link>
            </div>

            <div className="detail-metadata">
              {metadata.map(([label, value]) => (
                <div key={label} className="meta-item">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="tag-row">
              {prompt.tags.map(({ tag }) => (
                <Link href={`/search?tag=${tag.slug}`} key={tag.id}>#{tag.name}</Link>
              ))}
            </div>
          </div>
        </div>

        <section className="section-shell related-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">RELATED PROMPTS</span>
              <h2>More to explore</h2>
            </div>
          </div>
          <PromptGrid items={related} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
