import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/common/site-chrome';
import { CategorySlider } from '@/components/common/category-slider';
import { PromptGrid } from '@/components/prompts/prompt-grid';
import { getCategories, getPublishedPosts, getPublishedTools, trendingPrompts } from '@/lib/repositories/content';
import { findPublishedPrompts } from '@/lib/repositories/prompts';
import { getHeroSettings } from '@/lib/site-settings';

export default async function Home() {
  const [hero, trending, latest, categories, tools, posts] = await Promise.all([
    getHeroSettings(),
    trendingPrompts(4),
    findPublishedPrompts({ sort: 'latest', limit: 4 }),
    getCategories(),
    getPublishedTools(),
    getPublishedPosts(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <section
          className="hero-section"
          style={hero.imageUrl ? {
            backgroundImage: `linear-gradient(rgba(7, 18, 35, ${hero.overlayOpacity / 100}), rgba(7, 18, 35, ${Math.min(0.8, hero.overlayOpacity / 100 + 0.15)})), url(${hero.imageUrl})`,
          } : undefined}
        >
          <div className="hero-content">
            <span className="eyebrow">THE VISUAL PROMPT LIBRARY</span>
            <h1>{hero.title}</h1>
            <p>{hero.subtitle}</p>

            <form action="/search" className="hero-search">
              <input name="q" placeholder={hero.searchPlaceholder} aria-label="Search prompts" />
              <button type="submit">Search</button>
            </form>

            <div className="hero-actions">
              <Link href={hero.primaryCtaUrl} className="primary-action">{hero.primaryCtaText}</Link>
              <Link href={hero.secondaryCtaUrl} className="secondary-action">{hero.secondaryCtaText}</Link>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DISCOVER WHAT’S HOT</span>
              <h2>Trending prompts</h2>
            </div>
            <Link href="/trending">See all prompts</Link>
          </div>
          <PromptGrid items={trending} />
        </section>

        <section className="section-shell soft-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BROWSE BY SUBJECT</span>
              <h2>Popular categories</h2>
            </div>
            <Link href="/categories">All categories</Link>
          </div>
          <CategorySlider categories={categories.slice(0, 8)} />
        </section>

        <section className="section-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FRESHLY PUBLISHED</span>
              <h2>Latest prompts</h2>
            </div>
            <Link href="/prompts">View all prompts</Link>
          </div>
          <PromptGrid items={latest.items} />
        </section>

        <section className="section-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CREATE ANYWHERE</span>
              <h2>AI image tools</h2>
            </div>
            <Link href="/ai-tools">Explore tools</Link>
          </div>
          <div className="tool-grid">
            {tools.slice(0, 6).map((tool) => (
              <article key={tool.id} className="tool-card">
                <div className="tool-card-top">{tool.name}</div>
                <p>{tool.description}</p>
                <a href={tool.affiliateUrl || tool.website} rel="sponsored noopener" target="_blank">Visit tool</a>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell soft-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM THE JOURNAL</span>
              <h2>Creative inspiration</h2>
            </div>
            <Link href="/blog">Read the journal</Link>
          </div>
          <div className="blog-grid">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="blog-card">
                <small>{post.category?.name ?? 'GUIDES'}</small>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`}>Read article</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell newsletter-shell">
          <div>
            <span className="eyebrow">NEWSLETTER</span>
            <h2>Creative prompts sent weekly</h2>
          </div>
          <form action="/contact" className="newsletter-form">
            <input type="email" placeholder="Email address" aria-label="Email address" />
            <button type="submit">Join now</button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
