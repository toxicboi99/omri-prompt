import Link from 'next/link';
import { CopyPromptButton } from '@/components/prompts/copy-prompt-button';
import type { PromptWithRelations } from '@/lib/repositories/content';

export function PromptGrid({ items }: { items: PromptWithRelations[] }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <b>No prompts found</b>
        <p>Try a broader search or remove a filter.</p>
        <Link href="/prompts">View all prompts</Link>
      </div>
    );
  }

  return (
    <div className="prompt-grid">
      {items.map((prompt) => (
        <article className="prompt-card" key={prompt.id}>
          <Link
            href={`/prompts/${prompt.slug}`}
            className="prompt-card-media"
            style={prompt.exampleImage?.url ? { backgroundImage: `url(${prompt.exampleImage.url})` } : undefined}
            aria-label={`View ${prompt.title}`}
          >
            <span className="prompt-card-badge">{prompt.style.name}</span>
          </Link>

          <div className="prompt-card-body">
            <div className="prompt-card-meta">
              <span>{prompt.category.name}</span>
              <span>{prompt.copyCount.toLocaleString()} copies</span>
            </div>
            <h3>
              <Link href={`/prompts/${prompt.slug}`}>{prompt.title}</Link>
            </h3>
            <p>{prompt.description}</p>
            <div className="prompt-card-actions">
              <span>{prompt.prompt.length > 50 ? `${prompt.prompt.slice(0, 50)}…` : prompt.prompt}</span>
              <CopyPromptButton prompt={prompt.prompt} slug={prompt.slug} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
