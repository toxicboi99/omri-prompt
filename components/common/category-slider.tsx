'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  _count: { prompts: number };
};

export function CategorySlider({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>('.category-card');
    track.scrollBy({ left: direction * ((card?.offsetWidth ?? track.clientWidth) + 24), behavior: 'smooth' });
  }

  return (
    <div className="category-slider">
      <div className="category-slider-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous categories" title="Previous categories">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next categories" title="Next categories">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="category-slider-track" ref={trackRef}>
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
    </div>
  );
}