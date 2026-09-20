'use client';

import { useState } from 'react';
import { PageIntro } from '@/components/common/page-intro';

export default function PromptGenerator() {
  const [subject, setSubject] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [result, setResult] = useState('');
  function generate() {
    const safeSubject = subject.trim() || 'confident portrait subject';
    setResult(`${style} AI photo of ${safeSubject}, intentional composition, natural skin texture, detailed environment, professional lighting, 85mm lens, high detail, 4:5 aspect ratio`);
  }
  return <PageIntro eyebrow="CREATE A STARTING POINT" title="AI Photo Prompt Generator" description="Turn a simple idea into a structured image prompt you can refine for any generator.">
    <div className="form-card">
      <label>What do you want to create?<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. a traveler in Kathmandu at sunrise"/></label>
      <label>Visual style<select value={style} onChange={(event) => setStyle(event.target.value)}><option>Cinematic</option><option>Editorial</option><option>Studio</option><option>Realistic</option><option>Vintage</option></select></label>
      <button className="primary-action" type="button" onClick={generate}>Generate prompt</button>
      {result && <><label>Your prompt<textarea aria-label="Generated prompt" value={result} readOnly rows={5}/></label><button className="google-action" type="button" onClick={() => navigator.clipboard.writeText(result)}>Copy prompt</button></>}
    </div>
  </PageIntro>;
}
