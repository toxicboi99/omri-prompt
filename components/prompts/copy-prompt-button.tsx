'use client';
import { useState } from 'react';
export function CopyPromptButton({ prompt, slug }: { prompt: string; slug?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(prompt); if (slug) { const anonymousId = localStorage.getItem('omri-prompt-anon') ?? crypto.randomUUID(); localStorage.setItem('omri-prompt-anon', anonymousId); void fetch(`/api/prompts/${slug}/activity`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'copy', anonymousId }) }); } setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { window.prompt('Copy this prompt:', prompt); } }
  return <button type="button" className={`copy-prompt-button${copied ? ' copied' : ''}`} onClick={copy}>{copied ? '✓ Prompt copied!' : 'Copy prompt'}</button>;
}
