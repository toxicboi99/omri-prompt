'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/common/brand';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="site-logo" aria-label="OMRI Prompt home">
        <BrandLogo className="site-logo-image" />
      </Link>
      <nav className={menuOpen ? 'is-open' : ''} aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <Link href="/prompts">Prompts</Link>
        <Link href="/categories">Categories</Link>
        <Link href="/blog">Journal</Link>
        <Link href="/ai-tools">AI Tools</Link>
      </nav>
      <div className="site-actions">
        <Link href="/search" aria-label="Search prompts" className="icon-link">Search</Link>
        <Link href="/login">Log in</Link>
        <Link className="site-signup" href="/register">Create account</Link>
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="site-logo footer-logo">
            <BrandLogo className="footer-logo-image" />
          </Link>
          <p>AI Photo Prompts &amp; Creative Inspiration</p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
          </div>
        </div>

        <div>
          <h3>Discover</h3>
          <Link href="/prompts">Prompts</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/trending">Trending</Link>
        </div>

        <div>
          <h3>Resources</h3>
          <Link href="/ai-tools">AI Tools</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/submit">Submit Prompt</Link>
        </div>

        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <div>
          <h3>Legal</h3>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 OMRI Prompt</span>
        <div className="newsletter-inline">
          <span>Newsletter</span>
          <Link href="/contact">Join the list</Link>
        </div>
      </div>
    </footer>
  );
}
