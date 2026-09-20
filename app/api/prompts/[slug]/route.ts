import { getPublishedPrompt } from '@/lib/repositories/prompts';

export async function GET(_request: Request, context: RouteContext<'/api/prompts/[slug]'>) {
  const { slug } = await context.params;
  const prompt = await getPublishedPrompt(slug);
  return prompt ? Response.json({ prompt }) : Response.json({ error: 'Prompt not found' }, { status: 404 });
}
