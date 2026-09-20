import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/common/site-chrome';
import { getCategories } from '@/lib/repositories/content';

export const metadata = { title: 'AI Photo Prompt Categories | OMRI Prompt' };

export default async function Categories() {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader />
      <main className="page-shell route-shell">
        <section className="section-shell route-intro-shell">
          <span className="eyebrow">BROWSE BY SUBJECT</span>
          <h1>AI Photo Prompt Categories</h1>
          <p>Discover visual directions for every type of portrait, lifestyle, fashion, travel, and creator workflow.</p>
        </section>

        <section className="section-shell">
          <div className="category-grid">
            {categories.map((category) => (
              <Link href={`/category/${category.slug}`} key={category.id} className="category-card">
                <div className="category-card-media" style={category.imageUrl ? { backgroundImage: `url(${category.imageUrl})` } : undefined} />
                <div className="category-card-copy">
                  <span>{category._count.prompts} prompts</span>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
