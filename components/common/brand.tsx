import Image from 'next/image';

export function BrandLogo({ className = '' }: { className?: string }) {
  return <Image src="/omri-prompt-logo.svg" alt="OMRI Prompt" width={760} height={250} priority className={className} />;
}