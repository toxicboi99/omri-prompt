import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/common/site-chrome';
import { getStyles } from '@/lib/repositories/content';

export const metadata = { title: 'AI Photo Styles | OMRI Prompt' };

export default async function StylesPage() {
  const styles = await getStyles();

  return (
    <>
      <SiteHeader />
      <main className="page-shell route-shell">
        <section className="section-shell route-intro-shell">
          <span className="eyebrow">VISUAL LANGUAGE</span>
          <h1>AI Photo Styles</h1>
          <p>Explore cinematic, editorial, moody, minimalist, and studio-led visual directions for every prompt.</p>
        </section>

        <section className="section-shell">
          <div className="style-grid">
            {styles.map((style) => (
              <Link href={`/style/${style.slug}`} key={style.id} className="style-card">
                <div className="style-card-media" style={style.imageUrl ? { backgroundImage: `url(${style.imageUrl})` } : undefined} />
                <div className="style-card-copy">
                  <h3>{style.name}</h3>
                  <p>{style.description}</p>
                  <span>{style._count.prompts} prompts</span>
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
